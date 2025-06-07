import { gql } from '@apollo/client';

// Admin login mutation
export const ADMIN_LOGIN = gql`
  mutation AdminLogin($username: String!, $password: String!) {
    adminLogin(username: $username, password: $password) {
      success
      token
      message
    }
  }
`;

// Create course mutation
export const CREATE_COURSE = gql`
  mutation CreateCourse($input: CourseInput!) {
    createCourse(input: $input) {
      success
      message
      course {
        course_ID
        course_code
        display_name
        semester
        roles_available
        is_disabled
        lecturer {
          user_ID
          firstname
          lastname
          email
        }
        skills {
          skill_ID
          name
        }
      }
    }
  }
`;

// Update course mutation
export const UPDATE_COURSE = gql`
  mutation UpdateCourse($course_ID: ID!, $input: UpdateCourseInput!) {
    updateCourse(course_ID: $course_ID, input: $input) {
      success
      message
      course {
        course_ID
        course_code
        display_name
        semester
        roles_available
        is_disabled
        lecturer {
          user_ID
          firstname
          lastname
          email
        }
        skills {
          skill_ID
          name
        }
      }
    }
  }
`;

// Delete course mutation
export const DELETE_COURSE = gql`
  mutation DeleteCourse($course_ID: ID!) {
    deleteCourse(course_ID: $course_ID) {
      success
      message
    }
  }
`;

// Assign lecturer to course mutation
export const ASSIGN_LECTURER_TO_COURSE = gql`
  mutation AssignLecturerToCourse($lecturerId: ID!, $courseId: ID!) {
    assignLecturerToCourse(lecturerId: $lecturerId, courseId: $courseId) {
      success
      message
      course {
        course_ID
        course_code
        display_name
        lecturer {
          user_ID
          firstname
          lastname
          email
          is_lecturer
        }
      }
    }
  }
`;

// Remove lecturer from course mutation
export const REMOVE_LECTURER_FROM_COURSE = gql`
  mutation RemoveLecturerFromCourse($courseId: ID!) {
    removeLecturerFromCourse(courseId: $courseId) {
      success
      message
      course {
        course_ID
        course_code
        display_name
      }
    }
  }
`;

// Block user mutation
export const BLOCK_USER = gql`
  mutation BlockUser($userId: ID!) {
    blockUser(userId: $userId) {
      success
      message
      user {
        user_ID
        firstname
        lastname
        email
        is_blocked
        is_candidate
        is_lecturer
      }
    }
  }
`;

// Unblock user mutation
export const UNBLOCK_USER = gql`
  mutation UnblockUser($userId: ID!) {
    unblockUser(userId: $userId) {
      success
      message
      user {
        user_ID
        firstname
        lastname
        email
        is_blocked
        is_candidate
        is_lecturer
      }
    }
  }
`;

// Admin logout mutation
export const ADMIN_LOGOUT = gql`
  mutation AdminLogout {
    adminLogout {
      success
      message
    }
  }
`; 