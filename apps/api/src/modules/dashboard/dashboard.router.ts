import { Injectable } from '@nestjs/common';
import { implement } from '@orpc/server';
import { dashboardContract } from '@repo/contract';
import type { ORPCContext } from '../../orpc/orpc.context.js';
import { managerMiddleware } from '../../orpc/orpc.base.js';
import { DashboardService } from './dashboard.service.js';

const impl = implement(dashboardContract).$context<ORPCContext>();

@Injectable()
export class DashboardRouter {
  constructor(private service: DashboardService) {}

  get router() {
    return {
      stats: impl.stats.use(managerMiddleware).handler(async () => {
        return this.service.getStats();
      }),
    };
  }
}
