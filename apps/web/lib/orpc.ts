import { createORPCClient } from '@orpc/client';
import type { InferClientOutputs } from '@orpc/client';
import type { ContractRouterClient } from '@orpc/contract';
import { RPCLink } from '@orpc/client/fetch';
import { createRouterUtils } from '@orpc/tanstack-query';
import type { contract } from '@repo/contract';

type AppClient = ContractRouterClient<typeof contract>;

function getBaseUrl() {
  if (typeof window !== 'undefined') return window.location.origin;
  return process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';
}

const link = new RPCLink({
  url: `${getBaseUrl()}/api/rpc`,
  headers: async () => {
    if (typeof window !== 'undefined') return {};
    try {
      const { headers } = await import('next/headers');
      const h = await headers();
      const cookie = h.get('cookie');
      return cookie
        ? { cookie }
        : {};
    } catch {
      return {};
    }
  },
  fetch: (input, init) => fetch(input, { ...init, credentials: 'include' }),
});

const client: AppClient = createORPCClient(link);

export { client };
export const orpc = createRouterUtils(client);

export type AppOutputs = InferClientOutputs<AppClient>;
