import { oc } from '@orpc/contract';
import { z } from 'zod';
import {
  createPageSchema, updatePageSchema,
  createArticleSchema, updateArticleSchema,
  pageSchema, newsArticleSchema,
  successSchema,
} from '@repo/schemas';

export const cmsContract = {
  pages: {
    list: oc
      .input(z.object({ publishedOnly: z.boolean().default(false) }))
      .output(z.array(pageSchema)),
    getBySlug: oc
      .input(z.object({ slug: z.string() }))
      .output(pageSchema.nullable()),
    create: oc
      .input(createPageSchema)
      .output(pageSchema),
    update: oc
      .input(z.object({ id: z.number().int(), data: updatePageSchema }))
      .output(pageSchema.nullable()),
    delete: oc
      .input(z.object({ id: z.number().int() }))
      .output(successSchema),
  },
  articles: {
    list: oc
      .input(z.object({
        publishedOnly: z.boolean().default(true),
        limit: z.number().int().positive().default(20),
        offset: z.number().int().min(0).default(0),
      }))
      .output(z.array(newsArticleSchema)),
    getBySlug: oc
      .input(z.object({ slug: z.string() }))
      .output(newsArticleSchema.nullable()),
    create: oc
      .input(createArticleSchema)
      .output(newsArticleSchema),
    update: oc
      .input(z.object({ id: z.number().int(), data: updateArticleSchema }))
      .output(newsArticleSchema.nullable()),
    delete: oc
      .input(z.object({ id: z.number().int() }))
      .output(successSchema),
  },
};
