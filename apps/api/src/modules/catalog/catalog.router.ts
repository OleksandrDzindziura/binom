import { Injectable } from '@nestjs/common';
import { implement } from '@orpc/server';
import { catalogContract } from '@repo/contract';
import type { ORPCContext } from '../../orpc/orpc.context.js';
import { adminMiddleware } from '../../orpc/orpc.base.js';
import { CatalogService } from './catalog.service.js';

const impl = implement(catalogContract).$context<ORPCContext>();

@Injectable()
export class CatalogRouter {
  constructor(private service: CatalogService) {}

  get router() {
    return {
      projects: {
        list: impl.projects.list.handler(async ({ input }) => {
          return this.service.listProjects(input);
        }),
        getById: impl.projects.getById.handler(async ({ input }) => {
          return this.service.getProjectById(input.id);
        }),
        create: impl.projects.create.use(adminMiddleware).handler(async ({ input }) => {
          return this.service.createProject(input);
        }),
        update: impl.projects.update.use(adminMiddleware).handler(async ({ input }) => {
          return this.service.updateProject(input.id, input.data);
        }),
        delete: impl.projects.delete.use(adminMiddleware).handler(async ({ input }) => {
          return this.service.deleteProject(input.id);
        }),
        archive: impl.projects.archive.use(adminMiddleware).handler(async ({ input }) => {
          return this.service.archiveProject(input.id);
        }),
        unarchive: impl.projects.unarchive.use(adminMiddleware).handler(async ({ input }) => {
          return this.service.unarchiveProject(input.id);
        }),
      },
      images: {
        add: impl.images.add.use(adminMiddleware).handler(async ({ input }) => {
          return this.service.addProjectImage(input);
        }),
        delete: impl.images.delete.use(adminMiddleware).handler(async ({ input }) => {
          return this.service.deleteProjectImage(input.id);
        }),
        setMain: impl.images.setMain.use(adminMiddleware).handler(async ({ input }) => {
          return this.service.setMainImage(input.imageId, input.projectId);
        }),
        reorder: impl.images.reorder.use(adminMiddleware).handler(async ({ input }) => {
          return this.service.reorderImages(input.projectId, input.imageIds);
        }),
      },
    };
  }
}
