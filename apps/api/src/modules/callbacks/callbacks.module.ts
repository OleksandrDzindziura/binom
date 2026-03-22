import { Module } from '@nestjs/common';
import { CallbacksService } from './callbacks.service.js';
import { CallbacksRouter } from './callbacks.router.js';

@Module({
  providers: [CallbacksService, CallbacksRouter],
  exports: [CallbacksService, CallbacksRouter],
})
export class CallbacksModule {}
