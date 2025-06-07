// Configuration for the admin frontend
export const config = {
  graphqlEndpoint: process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT || 'http://localhost:4000/graphql',
  appEnv: process.env.NEXT_PUBLIC_APP_ENV || 'development',
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
} as const; 