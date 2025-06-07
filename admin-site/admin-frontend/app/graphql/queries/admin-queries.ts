import { gql } from '@apollo/client';

// Query to get all courses
export const GET_COURSES = gql`
  query GetCourses {
    courses {
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
        is_lecturer
        is_candidate
        is_admin
        is_blocked
      }
      skills {
        skill_ID
        name
      }
    }
  }
`;

// Query to get all users (students and lecturers)
export const GET_USERS = gql`
  query GetUsers($is_lecturer: Boolean, $is_candidate: Boolean) {
    users(is_lecturer: $is_lecturer, is_candidate: $is_candidate) {
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
      userSkills {
        skill {
          skill_ID
          name
        }
      }
    }
  }
`;

// Query to get all lecturers specifically
export const GET_LECTURERS = gql`
  query GetLecturers {
    lecturers {
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
      userSkills {
        skill {
          skill_ID
          name
        }
      }
    }
  }
`;

// Query to get candidates report
export const GET_CANDIDATES_REPORT = gql`
  query GetCandidatesReport {
    candidatesReport {
      chosenCandidates {
        user_ID
        firstname
        lastname
        email
        courses {
          course_ID
          course_code
          display_name
          semester
        }
      }
      multipleCoursesCandidates {
        user_ID
        firstname
        lastname
        email
        courseCount
      }
      unassignedCandidates {
        user_ID
        firstname
        lastname
        email
        is_candidate
        is_blocked
      }
    }
  }
`;

// Query to get a specific course by ID
export const GET_COURSE = gql`
  query GetCourse($course_ID: ID!) {
    course(course_ID: $course_ID) {
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
        is_lecturer
        is_candidate
        is_admin
      }
      skills {
        skill_ID
        name
      }
    }
  }
`;

// Query to get all skills
export const GET_SKILLS = gql`
  query GetSkills {
    skills {
      skill_ID
      name
    }
  }
`;

// Query to get all applications (for reporting)
export const GET_APPLICATIONS = gql`
  query GetApplications {
    applications {
      application_ID
      applied_availability
      accepted
      ranking
      role
      lecturer_comment
      is_withdrawn
      user {
        user_ID
        firstname
        lastname
        email
        is_candidate
        is_blocked
      }
      course {
        course_ID
        course_code
        display_name
        semester
      }
      appliedSkills {
        skill {
          skill_ID
          name
        }
      }
    }
  }
`;

// Query to get dashboard stats
export const GET_DASHBOARD_STATS = gql`
  query GetDashboardStats {
    dashboardStats {
      totalCourses
      totalCandidates
      totalLecturers
      activeCourses
      blockedUsers
      totalApplications
      pendingApplications
      acceptedApplications
    }
  }
`; 