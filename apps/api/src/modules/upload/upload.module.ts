import { Module } from '@nestjs/common';
import { UploadRouter } from './upload.router.js';

@Module({
  providers: [UploadRouter],
  exports: [UploadRouter],
})
export class UploadModule {}
