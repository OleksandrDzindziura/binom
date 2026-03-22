import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { CloudflareThrottlerGuard } from './common/cloudflare-throttler.guard.js';
import { DatabaseModule } from './database/database.module.js';
import { AuthModule } from './auth/auth.module.js';
import { CatalogModule } from './modules/catalog/catalog.module.js';
import { CallbacksModule } from './modules/callbacks/callbacks.module.js';
import { CmsModule } from './modules/cms/cms.module.js';
import { UploadModule } from './modules/upload/upload.module.js';
import { DashboardModule } from './modules/dashboard/dashboard.module.js';
import { AppRouter } from './app.router.js';
import { ORPCContextFactory } from './orpc/orpc.context.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([
      { name: 'default', ttl: 60000, limit: 100 },
    ]),
    DatabaseModule,
    AuthModule,
    CatalogModule,
    CallbacksModule,
    CmsModule,
    UploadModule,
    DashboardModule,
  ],
  providers: [
    AppRouter,
    ORPCContextFactory,
    { provide: APP_GUARD, useClass: CloudflareThrottlerGuard },
  ],
  exports: [AppRouter],
})
export class AppModule {}
