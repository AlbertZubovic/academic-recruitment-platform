// Configuration for admin backend
export const config = {
  // Server configuration
  port: process.env.PORT || 4000,
  
  // JWT configuration
  jwtSecret: process.env.JWT_SECRET || 'admin-secret-key-2024',
  jwtExpiresIn: '8h',
  
  // Admin credentials (hardcoded as per requirement)
  adminCredentials: {
    username: 'admin',
    password: 'admin'
  },
  
  // CORS configuration
  corsOrigins: [
    'http://localhost:3001', // Admin frontend
    'http://localhost:3000', // Alternative port (keep for compatibility)
  ],
  
  // Environment
  isDevelopment: process.env.NODE_ENV !== 'production',
  isProduction: process.env.NODE_ENV === 'production',
} as const; 