import { Injectable } from '@nestjs/common';
import { CatalogRouter } from './modules/catalog/catalog.router.js';
import { CallbacksRouter } from './modules/callbacks/callbacks.router.js';
import { CmsRouter } from './modules/cms/cms.router.js';
import { UploadRouter } from './modules/upload/upload.router.js';
import { DashboardRouter } from './modules/dashboard/dashboard.router.js';

@Injectable()
export class AppRouter {
  constructor(
    private catalogRouter: CatalogRouter,
    private callbacksRouter: CallbacksRouter,
    private cmsRouter: CmsRouter,
    private uploadRouter: UploadRouter,
    private dashboardRouter: DashboardRouter,
  ) {}

  get router() {
    return {
      catalog: this.catalogRouter.router,
      callbacks: this.callbacksRouter.router,
      cms: this.cmsRouter.router,
      upload: this.uploadRouter.router,
      dashboard: this.dashboardRouter.router,
    };
  }
}
