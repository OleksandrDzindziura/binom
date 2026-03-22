import { Module } from '@nestjs/common';
import { DashboardService } from './dashboard.service.js';
import { DashboardRouter } from './dashboard.router.js';

@Module({
  providers: [DashboardService, DashboardRouter],
  exports: [DashboardService, DashboardRouter],
})
export class DashboardModule {}
