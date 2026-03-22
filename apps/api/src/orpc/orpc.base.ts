import { os } from '@orpc/server';
import { ORPCError } from '@orpc/server';
import { Logger } from '@nestjs/common';
import type { ORPCContext } from './orpc.context.js';

const logger = new Logger('ORPCProcedure');

// Base procedure — all procedures have access to context
export const baseProcedure = os.$context<ORPCContext>().use(async ({ next, path }) => {
  try {
    return await next();
  } catch (err) {
    if (!(err instanceof ORPCError)) {
      logger.error(`Unhandled error in procedure [${path.join('.')}]`, err instanceof Error ? err.stack : String(err));
    }
    throw err;
  }
});

// ─── Reusable middleware for contract implementations ───

export const authMiddleware = os
  .$context<ORPCContext>()
  .middleware(async ({ context, next }) => {
    if (!context.user) {
      throw new ORPCError('UNAUTHORIZED', { message: 'Необхідно увійти в систему' });
    }
    return next({ context: { ...context, user: context.user } });
  });

export const adminMiddleware = os
  .$context<ORPCContext>()
  .middleware(async ({ context, next }) => {
    if (!context.user) {
      throw new ORPCError('UNAUTHORIZED', { message: 'Необхідно увійти в систему' });
    }
    if (context.user.role !== 'admin') {
      throw new ORPCError('FORBIDDEN', { message: 'Доступ лише для адміністраторів' });
    }
    return next({ context });
  });

export const managerMiddleware = os
  .$context<ORPCContext>()
  .middleware(async ({ context, next }) => {
    if (!context.user) {
      throw new ORPCError('UNAUTHORIZED', { message: 'Необхідно увійти в систему' });
    }
    if (!['admin', 'manager'].includes(context.user.role)) {
      throw new ORPCError('FORBIDDEN', { message: 'Недостатньо прав доступу' });
    }
    return next({ context });
  });
