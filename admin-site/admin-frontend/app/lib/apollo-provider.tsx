'use client';

import { ApolloProvider } from '@apollo/client';
import { apolloClient } from './apollo-client';

interface ApolloClientProviderProps {
  children: React.ReactNode;
}

export function ApolloClientProvider({ children }: ApolloClientProviderProps) {
  return (
    <ApolloProvider client={apolloClient}>
      {children}
    </ApolloProvider>
  );
} 