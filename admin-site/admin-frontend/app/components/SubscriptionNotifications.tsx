'use client';

import React, { useState, useEffect } from 'react';
import { useSubscription } from '@apollo/client';
import { CANDIDATE_BLOCKED_SUBSCRIPTION } from '../graphql/queries';

interface CandidateBlockedData {
  candidateBlocked: {
    userId: string;
    firstName: string;
    lastName: string;
    blockedAt: string;
    reason: string;
    affectedCourses: {
      courseId: string;
      courseName: string;
      courseCode: string;
    }[];
  };
}

interface NotificationItem {
  id: number;
  type: string;
  message: string;
  details: CandidateBlockedData['candidateBlocked'];
  timestamp: Date;
}

const SubscriptionNotifications: React.FC = () => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  const { loading, error, data } = useSubscription<CandidateBlockedData>(CANDIDATE_BLOCKED_SUBSCRIPTION);

  // Handle subscription data updates
  useEffect(() => {
    if (data?.candidateBlocked) {
      const blocked = data.candidateBlocked;
      const notification = {
        id: Date.now(),
        type: 'candidate_blocked',
        message: `${blocked.firstName} ${blocked.lastName} has been blocked`,
        details: blocked,
        timestamp: new Date(),
      };
      
      setNotifications(prev => [notification, ...prev.slice(0, 4)]); // Keep only latest 5
      
      // Auto-remove after 10 seconds
      setTimeout(() => {
        setNotifications(prev => prev.filter(n => n.id !== notification.id));
      }, 10000);
    }
  }, [data]);

  if (error) {
    console.error('Subscription error:', error);
  }

  // Debug logging
  useEffect(() => {
    console.log('Subscription status:', { loading, error: error?.message, hasData: !!data });
  }, [loading, error, data]);

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {loading && (
        <div className="bg-blue-100 border border-blue-200 text-blue-700 px-4 py-2 rounded shadow">
          <div className="text-sm">🔌 Connecting to notifications...</div>
        </div>
      )}
      
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className="bg-red-100 border border-red-200 text-red-700 px-4 py-3 rounded shadow-lg max-w-sm"
        >
          <div className="flex justify-between items-start">
            <div>
              <div className="font-medium text-sm">🚫 Candidate Blocked</div>
              <div className="text-sm mt-1">{notification.message}</div>
              {notification.details.reason && (
                <div className="text-xs mt-1 opacity-75">
                  Reason: {notification.details.reason}
                </div>
              )}
              {notification.details.affectedCourses.length > 0 && (
                <div className="text-xs mt-1 opacity-75">
                  Affected courses: {notification.details.affectedCourses.length}
                </div>
              )}
            </div>
            <button
              onClick={() => setNotifications(prev => prev.filter(n => n.id !== notification.id))}
              className="text-red-400 hover:text-red-600 ml-2"
            >
              ×
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SubscriptionNotifications; 