import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AppNavigator from './src/navigation/AppNavigator';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      refetchOnWindowFocus: false,
      staleTime: 30000, // 30 seconds
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppNavigator />
      <StatusBar style="light" />
    </QueryClientProvider>
  );
}
