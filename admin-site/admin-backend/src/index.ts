import 'reflect-metadata';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@as-integrations/express5';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import express from 'express';
import http from 'http';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { config } from './config';
import { AppDataSource } from './data-source';
import { User } from './entities/User';
import { Course } from './entities/Course';
import { Application } from './entities/Application';

// Load environment variables
dotenv.config();

// JWT secret (use environment variable in production)
const JWT_SECRET = process.env.JWT_SECRET || 'admin-secret-key-2024';

// Admin credentials (hardcoded as per requirement)
const ADMIN_CREDENTIALS = {
  username: 'admin',
  password: 'admin'
};

// GraphQL Type Definitions
const typeDefs = `#graphql
  type AdminLoginResponse {
    success: Boolean!
    token: String
    message: String
  }

  type MutationResponse {
    success: Boolean!
    message: String
  }

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
  }

  type Course {
    course_ID: ID!
    course_code: String!
    display_name: String!
    semester: String!
    lecturer: User
    roles_available: [String!]!
    is_disabled: Boolean!
    applications: [Application!]
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
    is_withdrawn: Boolean!
    withdrawn_at: String
  }

  type DashboardStats {
    totalCourses: Int!
    totalStudents: Int!
    totalLecturers: Int!
    blockedUsers: Int!
  }

  type Query {
    # Health check query
    hello: String!
    
    # Dashboard stats
    dashboardStats: DashboardStats!
    
    # User queries
    users: [User!]!
    students: [User!]!
    lecturers: [User!]!
    blockedUsers: [User!]!
    
    # Course queries
    courses: [Course!]!
    activeCourses: [Course!]!
    disabledCourses: [Course!]!
    courseWithApplications(course_ID: ID!): Course
    
    # Application queries  
    applications: [Application!]!
    applicationsByCourse(course_ID: ID!): [Application!]!
  }

  type Mutation {
    # Admin authentication
    adminLogin(username: String!, password: String!): AdminLoginResponse!
    adminLogout: MutationResponse!
    
    # User management
    blockUser(user_ID: ID!): MutationResponse!
    unblockUser(user_ID: ID!): MutationResponse!
    
    # Course management
    assignLecturerToCourse(course_ID: ID!, lecturer_ID: ID!): MutationResponse!
    unassignLecturerFromCourse(course_ID: ID!): MutationResponse!
    createCourse(
      course_code: String!
      display_name: String!
      semester: String!
      lecturer_ID: ID
      roles_available: [String!]!
    ): MutationResponse!
    
    # Application management
    updateApplicationStatus(application_ID: ID!, accepted: Boolean!, lecturer_comment: String): MutationResponse!
  }
`;

// GraphQL Resolvers
const resolvers = {
  Query: {
    hello: () => 'Admin GraphQL server is running!',

    dashboardStats: async () => {
      try {
        const userRepository = AppDataSource.getRepository(User);
        const courseRepository = AppDataSource.getRepository(Course);

        const totalUsers = await userRepository.count();
        const totalStudents = await userRepository.count({ where: { is_candidate: true } });
        const totalLecturers = await userRepository.count({ where: { is_lecturer: true } });
        const blockedUsers = await userRepository.count({ where: { is_blocked: true } });
        const totalCourses = await courseRepository.count();

        return {
          totalCourses,
          totalStudents,
          totalLecturers,
          blockedUsers,
        };
      } catch (error) {
        console.error('[ADMIN] Error fetching dashboard stats:', error);
        return {
          totalCourses: 0,
          totalStudents: 0,
          totalLecturers: 0,
          blockedUsers: 0,
        };
      }
    },

    users: async () => {
      try {
        const userRepository = AppDataSource.getRepository(User);
        return await userRepository.find({
          order: { created: 'DESC' }
        });
      } catch (error) {
        console.error('[ADMIN] Error fetching users:', error);
        return [];
      }
    },

    students: async () => {
      try {
        const userRepository = AppDataSource.getRepository(User);
        return await userRepository.find({
          where: { is_candidate: true },
          order: { created: 'DESC' }
        });
      } catch (error) {
        console.error('[ADMIN] Error fetching students:', error);
        return [];
      }
    },

    lecturers: async () => {
      try {
        const userRepository = AppDataSource.getRepository(User);
        return await userRepository.find({
          where: { is_lecturer: true },
          order: { created: 'DESC' }
        });
      } catch (error) {
        console.error('[ADMIN] Error fetching lecturers:', error);
        return [];
      }
    },

    blockedUsers: async () => {
      try {
        const userRepository = AppDataSource.getRepository(User);
        return await userRepository.find({
          where: { is_blocked: true },
          order: { created: 'DESC' }
        });
      } catch (error) {
        console.error('[ADMIN] Error fetching blocked users:', error);
        return [];
      }
    },

    courses: async () => {
      try {
        const courseRepository = AppDataSource.getRepository(Course);
        return await courseRepository.find({
          relations: ['lecturer'],
          order: { course_code: 'ASC' }
        });
      } catch (error) {
        console.error('[ADMIN] Error fetching courses:', error);
        return [];
      }
    },

    courseWithApplications: async (_: any, { course_ID }: { course_ID: string }) => {
      try {
        const courseRepository = AppDataSource.getRepository(Course);
        const course = await courseRepository.findOne({
          where: { course_ID },
          relations: ['lecturer']
        });

        if (!course) return null;

        const applicationRepository = AppDataSource.getRepository(Application);
        const applications = await applicationRepository.find({
          where: { course: { course_ID } },
          relations: ['user', 'course'],
          order: { ranking: 'ASC' }
        });

        return { ...course, applications };
      } catch (error) {
        console.error('[ADMIN] Error fetching course with applications:', error);
        return null;
      }
    },

    applications: async () => {
      try {
        const applicationRepository = AppDataSource.getRepository(Application);
        return await applicationRepository.find({
          relations: ['user', 'course'],
          order: { ranking: 'ASC' }
        });
      } catch (error) {
        console.error('[ADMIN] Error fetching applications:', error);
        return [];
      }
    },

    applicationsByCourse: async (_: any, { course_ID }: { course_ID: string }) => {
      try {
        const applicationRepository = AppDataSource.getRepository(Application);
        return await applicationRepository.find({
          where: { course: { course_ID } },
          relations: ['user', 'course'],
          order: { ranking: 'ASC' }
        });
      } catch (error) {
        console.error('[ADMIN] Error fetching applications by course:', error);
        return [];
      }
    },

    activeCourses: async () => {
      try {
        const courseRepository = AppDataSource.getRepository(Course);
        return await courseRepository.find({
          where: { is_disabled: false },
          relations: ['lecturer'],
          order: { course_code: 'ASC' }
        });
      } catch (error) {
        console.error('[ADMIN] Error fetching active courses:', error);
        return [];
      }
    },

    disabledCourses: async () => {
      try {
        const courseRepository = AppDataSource.getRepository(Course);
        return await courseRepository.find({
          where: { is_disabled: true },
          relations: ['lecturer'],
          order: { course_code: 'ASC' }
        });
      } catch (error) {
        console.error('[ADMIN] Error fetching disabled courses:', error);
        return [];
      }
    },
  },

  Mutation: {
    adminLogin: async (_: any, { username, password }: { username: string; password: string }) => {
      try {
        console.log(`[ADMIN AUTH] Login attempt for username: ${username}`);

        // Validate credentials (hardcoded admin/admin)
        if (username !== ADMIN_CREDENTIALS.username || password !== ADMIN_CREDENTIALS.password) {
          console.log(`[ADMIN AUTH] Invalid credentials for username: ${username}`);
          return {
            success: false,
            token: null,
            message: 'Invalid admin credentials'
          };
        }

        // Generate JWT token
        const token = jwt.sign(
          { 
            username: ADMIN_CREDENTIALS.username,
            role: 'admin',
            iat: Math.floor(Date.now() / 1000)
          },
          JWT_SECRET,
          { expiresIn: '8h' } // Token expires in 8 hours
        );

        console.log(`[ADMIN AUTH] Successful login for admin user`);

        return {
          success: true,
          token,
          message: 'Admin login successful'
        };

      } catch (error) {
        console.error('[ADMIN AUTH] Login error:', error);
        return {
          success: false,
          token: null,
          message: 'Internal server error during authentication'
        };
      }
    },

    adminLogout: async () => {
      // For JWT tokens, logout is handled client-side by removing the token
      // This endpoint can be used for logging or cleanup if needed
      console.log(`[ADMIN AUTH] Admin logout`);
      
      return {
        success: true,
        message: 'Admin logout successful'
      };
    },

    blockUser: async (_: any, { user_ID }: { user_ID: string }) => {
      try {
        const userRepository = AppDataSource.getRepository(User);
        const user = await userRepository.findOne({ where: { user_ID } });
        
        if (!user) {
          return { success: false, message: 'User not found' };
        }

        if (user.is_blocked) {
          return { success: false, message: 'User is already blocked' };
        }

        await userRepository.update(user_ID, { is_blocked: true });
        return { success: true, message: 'User blocked successfully' };
      } catch (error) {
        console.error('[ADMIN] Error blocking user:', error);
        return { success: false, message: 'Failed to block user' };
      }
    },

    unblockUser: async (_: any, { user_ID }: { user_ID: string }) => {
      try {
        const userRepository = AppDataSource.getRepository(User);
        const user = await userRepository.findOne({ where: { user_ID } });
        
        if (!user) {
          return { success: false, message: 'User not found' };
        }

        if (!user.is_blocked) {
          return { success: false, message: 'User is not blocked' };
        }

        await userRepository.update(user_ID, { is_blocked: false });
        return { success: true, message: 'User unblocked successfully' };
      } catch (error) {
        console.error('[ADMIN] Error unblocking user:', error);
        return { success: false, message: 'Failed to unblock user' };
      }
    },

    assignLecturerToCourse: async (_: any, { course_ID, lecturer_ID }: { course_ID: string; lecturer_ID: string }) => {
      try {
        const courseRepository = AppDataSource.getRepository(Course);
        const userRepository = AppDataSource.getRepository(User);

        const course = await courseRepository.findOne({ where: { course_ID } });
        if (!course) {
          return { success: false, message: 'Course not found' };
        }

        const lecturer = await userRepository.findOne({ where: { user_ID: lecturer_ID, is_lecturer: true } });
        if (!lecturer) {
          return { success: false, message: 'Lecturer not found or user is not a lecturer' };
        }

        await courseRepository.update(course_ID, { lecturer: lecturer });
        return { success: true, message: 'Lecturer assigned successfully' };
      } catch (error) {
        console.error('[ADMIN] Error assigning lecturer:', error);
        return { success: false, message: 'Failed to assign lecturer' };
      }
    },

    unassignLecturerFromCourse: async (_: any, { course_ID }: { course_ID: string }) => {
      try {
        const courseRepository = AppDataSource.getRepository(Course);
        const course = await courseRepository.findOne({ where: { course_ID } });
        
        if (!course) {
          return { success: false, message: 'Course not found' };
        }

        await courseRepository.update(course_ID, { lecturer: null });
        return { success: true, message: 'Lecturer unassigned successfully' };
      } catch (error) {
        console.error('[ADMIN] Error unassigning lecturer:', error);
        return { success: false, message: 'Failed to unassign lecturer' };
      }
    },

    createCourse: async (_: any, { course_code, display_name, semester, lecturer_ID, roles_available }: {
      course_code: string;
      display_name: string;
      semester: string;
      lecturer_ID?: string;
      roles_available: string[];
    }) => {
      try {
        const courseRepository = AppDataSource.getRepository(Course);
        const userRepository = AppDataSource.getRepository(User);

        // Check if course code already exists
        const existingCourse = await courseRepository.findOne({ where: { course_code } });
        if (existingCourse) {
          return { success: false, message: 'Course with this code already exists' };
        }

        let lecturer = null;
        if (lecturer_ID) {
          lecturer = await userRepository.findOne({ where: { user_ID: lecturer_ID, is_lecturer: true } });
          if (!lecturer) {
            return { success: false, message: 'Lecturer not found or user is not a lecturer' };
          }
        }

        const course = new Course();
        course.course_ID = require('crypto').randomUUID();
        course.course_code = course_code;
        course.display_name = display_name;
        course.semester = semester;
        course.lecturer = lecturer;
        course.roles_available = roles_available as ("Lab-Assistant" | "Tutor")[];
        course.is_disabled = false;

        await courseRepository.save(course);
        return { success: true, message: 'Course created successfully' };
      } catch (error) {
        console.error('[ADMIN] Error creating course:', error);
        return { success: false, message: 'Failed to create course' };
      }
    },

    updateApplicationStatus: async (_: any, { application_ID, accepted, lecturer_comment }: {
      application_ID: string;
      accepted: boolean;
      lecturer_comment?: string;
    }) => {
      try {
        const applicationRepository = AppDataSource.getRepository(Application);
        const application = await applicationRepository.findOne({ where: { application_ID } });
        
        if (!application) {
          return { success: false, message: 'Application not found' };
        }

        await applicationRepository.update(application_ID, {
          accepted,
          lecturer_comment: lecturer_comment || null
        });

        return { success: true, message: 'Application status updated successfully' };
      } catch (error) {
        console.error('[ADMIN] Error updating application status:', error);
        return { success: false, message: 'Failed to update application status' };
      }
    }
  }
};

// Create Express app
const app = express();
const httpServer = http.createServer(app);

// Create Apollo Server
const server = new ApolloServer({
  typeDefs,
  resolvers,
  plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
});

// Start the server
async function startServer() {
  try {
    // Initialize database connection
    console.log('🗄️ Initializing database connection...');
    await AppDataSource.initialize();
    console.log('✅ Database connection established');

    await server.start();

 
    // Apply GraphQL middleware with proper configuration
    app.use('/graphql', 
      cors({
        origin: [...config.corsOrigins],
        credentials: true,
      }),
      express.json(),
      expressMiddleware(server, {
        context: async ({ req }) => {
          // Extract token from Authorization header for future use
          const token = req.headers.authorization?.replace('Bearer ', '') || '';
          
          // For admin endpoints, we can verify the token here
          let user = null;
          if (token) {
            try {
              user = jwt.verify(token, JWT_SECRET);
            } catch (error) {
              console.log('[AUTH] Invalid token provided');
            }
          }

          return { user, token };
        },
      })
    );

    // Start HTTP server
    const port = config.port;
    await new Promise<void>((resolve) => httpServer.listen({ port }, resolve));
    
    console.log(`🚀 Admin GraphQL server ready at http://localhost:${port}/graphql`);
    console.log(`🌐 CORS enabled for: ${config.corsOrigins.join(', ')}`);
    console.log(`📋 Available operations:`);
    console.log(`   • Query: hello, dashboardStats, users, students, lecturers, blockedUsers, courses`);
    console.log(`   • Mutation: adminLogin, adminLogout, blockUser, unblockUser`);
    console.log(`🔐 Admin credentials: admin / admin`);
    
  } catch (error) {
    console.error('❌ Error starting server:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🛑 SIGINT received, shutting down gracefully');
  process.exit(0);
});

// Start the server
startServer(); 