import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AppNavigator from './src/navigation/AppNavigator';

// Create a client with aggressive caching for offline mode
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Retry only once to fail fast offline
      retry: 1,
      // Don't refetch on window focus
      refetchOnWindowFocus: false,
      // Don't refetch on mount - use cache
      refetchOnMount: false,
      // Don't refetch on reconnect - use cache
      refetchOnReconnect: false,
      // Cache data for 24 hours (considered fresh)
      staleTime: 1000 * 60 * 60 * 24, // 24 hours
      // Keep unused data in cache for 48 hours
      cacheTime: 1000 * 60 * 60 * 48, // 48 hours
      // Network mode: fetch if online, use cache if offline
      networkMode: 'offlineFirst',
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
