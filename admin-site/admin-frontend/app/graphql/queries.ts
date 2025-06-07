import { gql } from '@apollo/client';

// Authentication queries
export const ADMIN_LOGIN = gql`
  mutation AdminLogin($username: String!, $password: String!) {
    adminLogin(username: $username, password: $password) {
      success
      token
      message
    }
  }
`;

export const ADMIN_LOGOUT = gql`
  mutation AdminLogout {
    adminLogout {
      success
      message
    }
  }
`;

// Dashboard query
export const GET_DASHBOARD_STATS = gql`
  query GetDashboardStats {
    dashboardStats {
      totalCourses
      totalStudents
      totalLecturers
      blockedUsers
    }
  }
`;

// User queries
export const GET_ALL_USERS = gql`
  query GetAllUsers {
    users {
      user_ID
      email
      firstname
      lastname
      is_lecturer
      is_candidate
      is_admin
      is_blocked
      default_availability
      academic_credentials
      created
    }
  }
`;

export const GET_STUDENTS = gql`
  query GetStudents {
    students {
      user_ID
      email
      firstname
      lastname
      is_blocked
      default_availability
      academic_credentials
      created
    }
  }
`;

export const GET_LECTURERS = gql`
  query GetLecturers {
    lecturers {
      user_ID
      email
      firstname
      lastname
      is_blocked
      academic_credentials
      created
    }
  }
`;

export const GET_BLOCKED_USERS = gql`
  query GetBlockedUsers {
    blockedUsers {
      user_ID
      email
      firstname
      lastname
      is_lecturer
      is_candidate
      created
    }
  }
`;

// Course queries
export const GET_ALL_COURSES = gql`
  query GetAllCourses {
    courses {
      course_ID
      course_code
      display_name
      semester
      is_disabled
      roles_available
      lecturer {
        user_ID
        firstname
        lastname
        email
      }
    }
  }
`;

export const GET_ACTIVE_COURSES = gql`
  query GetActiveCourses {
    activeCourses {
      course_ID
      course_code
      display_name
      semester
      roles_available
      lecturer {
        user_ID
        firstname
        lastname
        email
      }
    }
  }
`;

export const GET_DISABLED_COURSES = gql`
  query GetDisabledCourses {
    disabledCourses {
      course_ID
      course_code
      display_name
      semester
      roles_available
      lecturer {
        user_ID
        firstname
        lastname
        email
      }
    }
  }
`;

// User management mutations
export const BLOCK_USER = gql`
  mutation BlockUser($user_ID: ID!) {
    blockUser(user_ID: $user_ID) {
      success
      message
    }
  }
`;

export const UNBLOCK_USER = gql`
  mutation UnblockUser($user_ID: ID!) {
    unblockUser(user_ID: $user_ID) {
      success
      message
    }
  }
`; 