import { cache } from 'react';
import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { makeQueryClient } from '../query-client';

/**
 * Per-request QueryClient for server components.
 * React cache() ensures one instance per request, not per render.
 */
export const getQueryClient = cache(makeQueryClient);

export function HydrateClient({ children }: { children: React.ReactNode }) {
  const queryClient = getQueryClient();
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      {children}
    </HydrationBoundary>
  );
}
