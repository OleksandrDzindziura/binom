import { Module } from '@nestjs/common';
import { CmsService } from './cms.service.js';
import { CmsRouter } from './cms.router.js';

@Module({
  providers: [CmsService, CmsRouter],
  exports: [CmsService, CmsRouter],
})
export class CmsModule {}
