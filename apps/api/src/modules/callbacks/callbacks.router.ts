import { Injectable } from '@nestjs/common';
import { implement } from '@orpc/server';
import { callbacksContract } from '@repo/contract';
import type { ORPCContext } from '../../orpc/orpc.context.js';
import { managerMiddleware } from '../../orpc/orpc.base.js';
import { CallbacksService } from './callbacks.service.js';

const impl = implement(callbacksContract).$context<ORPCContext>();

@Injectable()
export class CallbacksRouter {
  constructor(private service: CallbacksService) {}

  get router() {
    return {
      create: impl.create.handler(async ({ input }) => {
        return this.service.create(input);
      }),
      list: impl.list.use(managerMiddleware).handler(async ({ input }) => {
        return this.service.list(input.status, input.page, input.limit);
      }),
      updateStatus: impl.updateStatus.use(managerMiddleware).handler(async ({ input }) => {
        return this.service.updateStatus(input.id, input.status);
      }),
      getById: impl.getById.use(managerMiddleware).handler(async ({ input }) => {
        return this.service.getById(input.id);
      }),
    };
  }
}
