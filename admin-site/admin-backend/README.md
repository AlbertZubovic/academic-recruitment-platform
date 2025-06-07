# Admin Backend - GraphQL Server

This is the GraphQL backend for the TT Admin Dashboard. It provides secure admin authentication without requiring database connections for login validation.

## Features

- **Hardcoded Admin Authentication**: Username: `admin`, Password: `admin`
- **JWT Token Generation**: Secure token-based authentication
- **GraphQL API**: Apollo Server with type-safe operations
- **No Database Required**: Authentication is handled server-side without DB queries
- **CORS Enabled**: Configured for admin frontend access

## Quick Start

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start development server**:
   ```bash
   npm run dev
   ```

3. **Access GraphQL Playground**:
   - Server: http://localhost:4000/graphql
   - Frontend will connect automatically

## Available Operations

### Queries
```graphql
query {
  hello  # Health check
}
```

### Mutations
```graphql
# Admin Login
mutation AdminLogin($username: String!, $password: String!) {
  adminLogin(username: $username, password: $password) {
    success
    token
    message
  }
}

# Admin Logout
mutation AdminLogout {
  adminLogout {
    success
    message
  }
}
```

## Security

- ✅ **Server-side validation**: Credentials are validated on the backend
- ✅ **JWT tokens**: Secure token generation with 8-hour expiration
- ✅ **Hidden credentials**: Admin credentials are not exposed to client
- ✅ **CORS protection**: Only allowed origins can access the API

## Development

```bash
# Development with auto-reload
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## Architecture

```
admin-backend/
├── src/
│   ├── index.ts         # Main server file
│   └── config.ts        # Configuration
├── package.json
├── tsconfig.json
└── README.md
```

## Integration

The frontend Apollo Client is configured to connect to this backend at `http://localhost:4000/graphql`. The authentication flow:

1. User enters admin/admin on frontend
2. Frontend sends GraphQL mutation to backend
3. Backend validates credentials server-side
4. Backend returns JWT token if valid
5. Frontend stores token and uses for future requests

## Environment Variables

- `PORT`: Server port (default: 4000)
- `JWT_SECRET`: JWT signing secret (default: auto-generated)
- `NODE_ENV`: Environment (development/production)

## Future Extensions

This backend is ready for expansion with:
- Database integration for full admin operations
- Additional GraphQL resolvers for course management
- User management operations
- Reporting functionality
- GraphQL subscriptions for real-time features 