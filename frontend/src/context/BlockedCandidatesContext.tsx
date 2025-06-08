import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useSubscription } from '@apollo/client';
import { useToast } from '@chakra-ui/react';
import { 
  CANDIDATE_BLOCKED_SUBSCRIPTION, 
  CandidateBlockedSubscriptionData, 
  CandidateBlockedPayload 
} from '@/lib/graphql-subscriptions';
import { useAuth } from './AuthContext';

interface BlockedCandidatesContextType {
  blockedCandidates: Set<string>; // Set of blocked user IDs
  isUserBlocked: (userId: string) => boolean;
  getBlockedCandidateInfo: (userId: string) => CandidateBlockedPayload | null;
  onCandidateBlocked: (callback: () => void) => void; // Register callback for when candidate is blocked
  removeCandidateBlockedCallback: (callback: () => void) => void; // Remove callback
}

const BlockedCandidatesContext = createContext<BlockedCandidatesContextType | undefined>(undefined);

interface BlockedCandidatesProviderProps {
  children: ReactNode;
}

export const BlockedCandidatesProvider: React.FC<BlockedCandidatesProviderProps> = ({ children }) => {
  const [blockedCandidates, setBlockedCandidates] = useState<Set<string>>(new Set());
  const [blockedCandidateDetails, setBlockedCandidateDetails] = useState<Map<string, CandidateBlockedPayload>>(new Map());
  const [candidateBlockedCallbacks, setCandidateBlockedCallbacks] = useState<Set<() => void>>(new Set());
  const toast = useToast();
  const { user } = useAuth();

  // Load blocked candidates from the main backend on initialization
  useEffect(() => {
    const loadBlockedCandidates = async () => {
      try {
        console.log('[BLOCKED_CANDIDATES] Loading initial blocked candidates...');
        const response = await fetch('http://localhost:5000/api/users/candidates', {
          credentials: 'include',
        });
        
        if (response.ok) {
          const candidates: Array<{ id: string; isBlocked: boolean }> = await response.json();
          const blocked = candidates
            .filter((candidate) => candidate.isBlocked)
            .map((candidate) => candidate.id);
          
          console.log('[BLOCKED_CANDIDATES] Found blocked candidates:', blocked);
          setBlockedCandidates(new Set(blocked));
        }
      } catch (error) {
        console.error('[BLOCKED_CANDIDATES] Error loading blocked candidates:', error);
      }
    };

    if (user?.isLecturer) {
      loadBlockedCandidates();
    }
  }, [user?.isLecturer]);

  // Subscribe to candidate blocked events
  const { error } = useSubscription<CandidateBlockedSubscriptionData>(
    CANDIDATE_BLOCKED_SUBSCRIPTION,
    {
      skip: !user?.isLecturer, // Only subscribe if user is a lecturer
      onData: ({ data }) => {
        const payload = data.data?.candidateBlocked;
        if (payload) {
          console.log('Received candidate blocked notification:', payload);
          handleCandidateBlocked(payload);
        }
      },
      onError: (error) => {
        console.error('Subscription error:', error);
      }
    }
  );

  const handleCandidateBlocked = useCallback((payload: CandidateBlockedPayload) => {
    // Add to blocked candidates set
    setBlockedCandidates(prev => new Set(prev.add(payload.userId)));
    
    // Store detailed information
    setBlockedCandidateDetails(prev => new Map(prev.set(payload.userId, payload)));
    
    // Check if this candidate affects any of the lecturer's courses
    const affectedCourseNames = payload.affectedCourses.map(course => course.courseName);
    
    if (affectedCourseNames.length > 0) {
      // Show toast notification
      toast({
        title: "Candidate Blocked",
        description: `${payload.firstName} ${payload.lastName} has been blocked and is no longer available for hiring. Affected courses: ${affectedCourseNames.join(', ')}`,
        status: "warning",
        duration: 8000,
        isClosable: true,
        position: "top-right",
      });
    }

    // Trigger all registered callbacks to refetch application data
    console.log('[BLOCKED_CANDIDATES] Triggering callbacks for blocked candidate:', payload.userId);
    candidateBlockedCallbacks.forEach(callback => {
      try {
        callback();
      } catch (error) {
        console.error('[BLOCKED_CANDIDATES] Error in callback:', error);
      }
    });
  }, [candidateBlockedCallbacks, toast]);

  const isUserBlocked = useCallback((userId: string): boolean => {
    return blockedCandidates.has(userId);
  }, [blockedCandidates]);

  const getBlockedCandidateInfo = useCallback((userId: string): CandidateBlockedPayload | null => {
    return blockedCandidateDetails.get(userId) || null;
  }, [blockedCandidateDetails]);

  const onCandidateBlocked = useCallback((callback: () => void) => {
    setCandidateBlockedCallbacks(prev => new Set(prev.add(callback)));
  }, []);

  const removeCandidateBlockedCallback = useCallback((callback: () => void) => {
    setCandidateBlockedCallbacks(prev => {
      const newSet = new Set(prev);
      newSet.delete(callback);
      return newSet;
    });
  }, []);

  useEffect(() => {
    if (error) {
      console.error('BlockedCandidates subscription error:', error);
    }
  }, [error]);

  const value: BlockedCandidatesContextType = {
    blockedCandidates,
    isUserBlocked,
    getBlockedCandidateInfo,
    onCandidateBlocked,
    removeCandidateBlockedCallback,
  };

  return (
    <BlockedCandidatesContext.Provider value={value}>
      {children}
    </BlockedCandidatesContext.Provider>
  );
};

export const useBlockedCandidates = (): BlockedCandidatesContextType => {
  const context = useContext(BlockedCandidatesContext);
  if (context === undefined) {
    throw new Error('useBlockedCandidates must be used within a BlockedCandidatesProvider');
  }
  return context;
}; 