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

// Course management queries
export const GET_COURSE_WITH_APPLICATIONS = gql`
  query GetCourseWithApplications($course_ID: ID!) {
    courseWithApplications(course_ID: $course_ID) {
      course_ID
      course_code
      display_name
      semester
      lecturer {
        user_ID
        firstname
        lastname
        email
      }
      roles_available
      is_disabled
      applications {
        application_ID
        user {
          user_ID
          firstname
          lastname
          email
        }
        applied_availability
        accepted
        ranking
        role
        lecturer_comment
        is_withdrawn
        withdrawn_at
      }
    }
  }
`;

export const GET_ALL_APPLICATIONS = gql`
  query GetAllApplications {
    applications {
      application_ID
      user {
        user_ID
        firstname
        lastname
        email
      }
      course {
        course_ID
        course_code
        display_name
        semester
      }
      applied_availability
      accepted
      ranking
      role
      lecturer_comment
      is_withdrawn
      withdrawn_at
    }
  }
`;

// Course management mutations
export const ASSIGN_LECTURER_TO_COURSE = gql`
  mutation AssignLecturerToCourse($course_ID: ID!, $lecturer_ID: ID!) {
    assignLecturerToCourse(course_ID: $course_ID, lecturer_ID: $lecturer_ID) {
      success
      message
    }
  }
`;

export const UNASSIGN_LECTURER_FROM_COURSE = gql`
  mutation UnassignLecturerFromCourse($course_ID: ID!) {
    unassignLecturerFromCourse(course_ID: $course_ID) {
      success
      message
    }
  }
`;

export const CREATE_COURSE = gql`
  mutation CreateCourse(
    $course_code: String!
    $display_name: String!
    $semester: String!
    $lecturer_ID: ID
    $roles_available: [String!]!
  ) {
    createCourse(
      course_code: $course_code
      display_name: $display_name
      semester: $semester
      lecturer_ID: $lecturer_ID
      roles_available: $roles_available
    ) {
      success
      message
    }
  }
`;

export const UPDATE_APPLICATION_STATUS = gql`
  mutation UpdateApplicationStatus(
    $application_ID: ID!
    $accepted: Boolean!
    $lecturer_comment: String
  ) {
    updateApplicationStatus(
      application_ID: $application_ID
      accepted: $accepted
      lecturer_comment: $lecturer_comment
    ) {
      success
      message
    }
  }
`; 