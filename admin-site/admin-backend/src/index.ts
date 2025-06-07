import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import express from 'express';
import http from 'http';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { config } from './config';

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

  type Query {
    # Health check query
    hello: String!
  }

  type Mutation {
    # Admin authentication
    adminLogin(username: String!, password: String!): AdminLoginResponse!
    adminLogout: MutationResponse!
  }
`;

// GraphQL Resolvers
const resolvers = {
  Query: {
    hello: () => 'Admin GraphQL server is running!',
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
    await server.start();

    // Set up CORS
    app.use(cors({
      origin: [...config.corsOrigins],
      credentials: true,
    }));

    // Set up Express middleware
    app.use(express.json());

    // Apply GraphQL middleware
    app.use('/graphql', expressMiddleware(server, {
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
    }));

    // Start HTTP server
    const port = config.port;
    await new Promise<void>((resolve) => httpServer.listen({ port }, resolve));
    
    console.log(`🚀 Admin GraphQL server ready at http://localhost:${port}/graphql`);
    console.log(`🌐 CORS enabled for: ${config.corsOrigins.join(', ')}`);
    console.log(`📋 Available operations:`);
    console.log(`   • Query: hello`);
    console.log(`   • Mutation: adminLogin(username, password)`);
    console.log(`   • Mutation: adminLogout`);
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