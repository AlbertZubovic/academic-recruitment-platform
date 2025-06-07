# Admin Backend GraphQL Schema Requirements

This document outlines the GraphQL schema that needs to be implemented in the admin backend to match the existing database entities and support all admin functionality.

## Database Entities Overview

Based on the existing backend, we have these key entities:

### User Entity
```typescript
{
  user_ID: string (UUID)
  email: string (unique)
  password: string (hashed)
  firstname: string
  lastname: string
  is_lecturer: boolean
  is_candidate: boolean
  is_admin: boolean
  is_blocked: boolean
  default_availability: "Full-Time" | "Part-Time" | null
  academic_credentials: string | null
  created: Date
  userSkills: UserSkill[]
  pastRoles: PastRole[]
}
```

### Course Entity
```typescript
{
  course_ID: string (UUID)
  course_code: string (format: "COSC101")
  display_name: string
  semester: string
  lecturer: User
  roles_available: ("Tutor" | "Lab-Assistant")[]
  is_disabled: boolean
  skills: Skill[]
}
```

### Application Entity
```typescript
{
  application_ID: string (UUID)
  user: User
  course: Course
  applied_availability: "Full-Time" | "Part-Time"
  accepted: boolean | null
  ranking: number | null
  role: "Tutor" | "Lab-Assistant"
  lecturer_comment: string | null
  appliedSkills: AppliedSkill[]
  is_withdrawn: boolean
  withdrawn_at: Date | null
}
```

### Skill Entity
```typescript
{
  skill_ID: string (UUID)
  name: string
}
```

## Required GraphQL Schema

### Type Definitions

```graphql
type User {
  user_ID: ID!
  email: String!
  firstname: String!
  lastname: String!
  is_lecturer: Boolean!
  is_candidate: Boolean!
  is_admin: Boolean!
  is_blocked: Boolean!
  default_availability: String
  academic_credentials: String
  created: String!
  userSkills: [UserSkill!]!
  pastRoles: [PastRole!]!
}

type Course {
  course_ID: ID!
  course_code: String!
  display_name: String!
  semester: String!
  lecturer: User
  roles_available: [String!]!
  is_disabled: Boolean!
  skills: [Skill!]!
}

type Application {
  application_ID: ID!
  user: User!
  course: Course!
  applied_availability: String!
  accepted: Boolean
  ranking: Int
  role: String!
  lecturer_comment: String
  appliedSkills: [AppliedSkill!]!
  is_withdrawn: Boolean!
  withdrawn_at: String
}

type Skill {
  skill_ID: ID!
  name: String!
}

type UserSkill {
  user: User!
  skill: Skill!
}

type PastRole {
  id: ID!
  courseCode: String!
  courseName: String!
  role: String!
  semester: String
}

type AppliedSkill {
  application_ID: ID!
  skill_ID: ID!
  skill: Skill!
}

# Input Types
input CourseInput {
  course_code: String!
  display_name: String!
  semester: String!
  roles_available: [String!]!
  is_disabled: Boolean
  skillIds: [ID!]
  lecturerId: ID
}

input UpdateCourseInput {
  course_code: String
  display_name: String
  semester: String
  roles_available: [String!]
  is_disabled: Boolean
  skillIds: [ID!]
  lecturerId: ID
}

# Response Types
type AdminLoginResponse {
  success: Boolean!
  token: String
  message: String
}

type MutationResponse {
  success: Boolean!
  message: String
}

type CourseResponse {
  success: Boolean!
  message: String
  course: Course
}

type UserResponse {
  success: Boolean!
  message: String
  user: User
}

# Report Types
type CandidateWithCourses {
  user_ID: ID!
  firstname: String!
  lastname: String!
  email: String!
  courses: [Course!]!
}

type CandidateWithCourseCount {
  user_ID: ID!
  firstname: String!
  lastname: String!
  email: String!
  courseCount: Int!
}

type CandidateReport {
  chosenCandidates: [CandidateWithCourses!]!
  multipleCoursesCandidates: [CandidateWithCourseCount!]!
  unassignedCandidates: [User!]!
}

type DashboardStats {
  totalCourses: Int!
  totalCandidates: Int!
  totalLecturers: Int!
  activeCourses: Int!
  blockedUsers: Int!
  totalApplications: Int!
  pendingApplications: Int!
  acceptedApplications: Int!
}
```

### Query Definitions

```graphql
type Query {
  # Course queries
  courses: [Course!]!
  course(course_ID: ID!): Course

  # User queries
  users(is_lecturer: Boolean, is_candidate: Boolean): [User!]!
  lecturers: [User!]!

  # Skill queries
  skills: [Skill!]!

  # Application queries
  applications: [Application!]!

  # Report queries
  candidatesReport: CandidateReport!

  # Dashboard queries
  dashboardStats: DashboardStats!
}
```

### Mutation Definitions

```graphql
type Mutation {
  # Authentication
  adminLogin(username: String!, password: String!): AdminLoginResponse!
  adminLogout: MutationResponse!

  # Course management
  createCourse(input: CourseInput!): CourseResponse!
  updateCourse(course_ID: ID!, input: UpdateCourseInput!): CourseResponse!
  deleteCourse(course_ID: ID!): MutationResponse!

  # Lecturer assignments
  assignLecturerToCourse(lecturerId: ID!, courseId: ID!): CourseResponse!
  removeLecturerFromCourse(courseId: ID!): CourseResponse!

  # User management
  blockUser(userId: ID!): UserResponse!
  unblockUser(userId: ID!): UserResponse!
}
```

## Admin Requirements Implementation

### 1. Admin Authentication
- **Username**: "admin"
- **Password**: "admin"
- JWT token-based authentication
- Admin access validation for all operations

### 2. Course Management (CRUD)
- ✅ Create courses with validation (course_code format, skills, lecturer assignment)
- ✅ Read all courses with lecturer and skills information
- ✅ Update course details (name, semester, roles, skills, lecturer)
- ✅ Delete courses (with proper validation)

### 3. Lecturer Assignments
- ✅ Assign lecturer to course (validate lecturer exists and is_lecturer=true)
- ✅ Remove lecturer from course
- ✅ View lecturer assignments

### 4. User Management
- ✅ Block/unblock users (toggle is_blocked field)
- ✅ View all users (candidates and lecturers)
- ✅ Filter users by type (is_lecturer, is_candidate)

### 5. Reporting
- ✅ Candidates chosen for courses (accepted=true applications)
- ✅ Candidates chosen for more than 3 courses
- ✅ Candidates not chosen for any courses (no accepted applications)

### 6. Dashboard Statistics
- ✅ Total counts for courses, candidates, lecturers
- ✅ Active vs disabled courses
- ✅ Blocked users count
- ✅ Application statistics

## Database Access Patterns

### Course Operations
```sql
-- Get all courses with lecturer and skills
SELECT c.*, u.firstname, u.lastname, s.name as skill_name
FROM Course c
LEFT JOIN User u ON c.lecturer = u.user_ID
LEFT JOIN course_skill cs ON c.course_ID = cs.course_ID
LEFT JOIN Skill s ON cs.skill_ID = s.skill_ID

-- Create course
INSERT INTO Course (course_ID, course_code, display_name, semester, roles_available, is_disabled, lecturer)
VALUES (?, ?, ?, ?, ?, ?, ?)
```

### User Blocking
```sql
-- Block user
UPDATE User SET is_blocked = true WHERE user_ID = ?

-- Unblock user
UPDATE User SET is_blocked = false WHERE user_ID = ?
```

### Report Queries
```sql
-- Candidates chosen for courses
SELECT u.*, c.course_code, c.display_name
FROM User u
JOIN Application a ON u.user_ID = a.user_ID
JOIN Course c ON a.course_ID = c.course_ID
WHERE a.accepted = true AND u.is_candidate = true

-- Candidates with multiple courses (>3)
SELECT u.user_ID, u.firstname, u.lastname, COUNT(*) as course_count
FROM User u
JOIN Application a ON u.user_ID = a.user_ID
WHERE a.accepted = true AND u.is_candidate = true
GROUP BY u.user_ID
HAVING COUNT(*) > 3
```

## Security Considerations

1. **Admin-only Access**: All mutations require admin authentication
2. **Input Validation**: Validate course codes, email formats, UUIDs
3. **Business Logic**: Prevent assigning non-lecturers to courses
4. **Data Integrity**: Maintain referential integrity for skills and assignments

## HD Feature Options

### Option 1: GraphQL Subscriptions
```graphql
type Subscription {
  candidateUnavailable: CandidateUnavailableNotification!
}

type CandidateUnavailableNotification {
  candidateId: ID!
  candidateName: String!
  affectedCourses: [Course!]!
  reason: String!
}
```

### Option 2: Unit Tests
- Test admin authentication
- Test course CRUD operations
- Test user blocking/unblocking
- Test lecturer assignments
- Test report generation
- Test input validation

## Next Steps

1. Set up Apollo Server with TypeORM integration
2. Implement authentication middleware
3. Create resolvers for all queries and mutations
4. Add input validation and error handling
5. Implement report generation logic
6. Choose and implement HD feature
7. Add comprehensive testing 