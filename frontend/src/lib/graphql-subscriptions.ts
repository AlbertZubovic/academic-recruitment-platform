import { gql } from '@apollo/client';

export const CANDIDATE_BLOCKED_SUBSCRIPTION = gql`
  subscription CandidateBlocked {
    candidateBlocked {
      userId
      firstName
      lastName
      blockedAt
      reason
      affectedCourses {
        courseId
        courseName
        courseCode
      }
    }
  }
`;

export interface CandidateBlockedPayload {
  userId: string;
  firstName: string;
  lastName: string;
  blockedAt: string;
  reason: string;
  affectedCourses: Array<{
    courseId: string;
    courseName: string;
    courseCode: string;
  }>;
}

export interface CandidateBlockedSubscriptionData {
  candidateBlocked: CandidateBlockedPayload;
} 