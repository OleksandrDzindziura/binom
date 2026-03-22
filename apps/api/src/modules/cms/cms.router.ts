import { Injectable } from '@nestjs/common';
import { implement } from '@orpc/server';
import { cmsContract } from '@repo/contract';
import type { ORPCContext } from '../../orpc/orpc.context.js';
import { adminMiddleware } from '../../orpc/orpc.base.js';
import { CmsService } from './cms.service.js';

const impl = implement(cmsContract).$context<ORPCContext>();

@Injectable()
export class CmsRouter {
  constructor(private service: CmsService) {}

  get router() {
    return {
      pages: {
        list: impl.pages.list.handler(async ({ input }) => {
          return this.service.listPages(input.publishedOnly);
        }),
        getBySlug: impl.pages.getBySlug.handler(async ({ input }) => {
          return this.service.getPageBySlug(input.slug);
        }),
        create: impl.pages.create.use(adminMiddleware).handler(async ({ input }) => {
          return this.service.createPage(input);
        }),
        update: impl.pages.update.use(adminMiddleware).handler(async ({ input }) => {
          return this.service.updatePage(input.id, input.data);
        }),
        delete: impl.pages.delete.use(adminMiddleware).handler(async ({ input }) => {
          return this.service.deletePage(input.id);
        }),
      },
      articles: {
        list: impl.articles.list.handler(async ({ input }) => {
          return this.service.listArticles(input.publishedOnly, input.limit, input.offset);
        }),
        getBySlug: impl.articles.getBySlug.handler(async ({ input }) => {
          return this.service.getArticleBySlug(input.slug);
        }),
        create: impl.articles.create.use(adminMiddleware).handler(async ({ input }) => {
          const { publishedAt, ...rest } = input;
          return this.service.createArticle({
            ...rest,
            publishedAt: publishedAt ? new Date(publishedAt) : undefined,
          });
        }),
        update: impl.articles.update.use(adminMiddleware).handler(async ({ input }) => {
          const { publishedAt, ...rest } = input.data;
          return this.service.updateArticle(input.id, {
            ...rest,
            ...(publishedAt !== undefined ? { publishedAt: publishedAt ? new Date(publishedAt) : undefined } : {}),
          });
        }),
        delete: impl.articles.delete.use(adminMiddleware).handler(async ({ input }) => {
          return this.service.deleteArticle(input.id);
        }),
      },
    };
  }
}
