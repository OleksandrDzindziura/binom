import { Module } from '@nestjs/common';
import { CatalogService } from './catalog.service.js';
import { CatalogRouter } from './catalog.router.js';

@Module({
  providers: [CatalogService, CatalogRouter],
  exports: [CatalogService, CatalogRouter],
})
export class CatalogModule {}
