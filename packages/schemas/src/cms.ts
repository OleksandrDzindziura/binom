import { z } from 'zod';

export const createPageSchema = z.object({
  slug: z.string().min(1).max(100).regex(/^[a-z0-9-]+$/),
  title: z.string().min(1).max(200),
  content: z.string().min(1),
  isPublished: z.boolean().default(false),
});

export const updatePageSchema = createPageSchema.partial().omit({ slug: true });

export const createArticleSchema = z.object({
  slug: z.string().min(1).max(100).regex(/^[a-z0-9-]+$/),
  title: z.string().min(1).max(200),
  content: z.string().min(1),
  imageUrl: z.string().url().optional(),
  isPublished: z.boolean().default(false),
  publishedAt: z.string().datetime().optional(),
});

export const updateArticleSchema = createArticleSchema.partial().omit({ slug: true });

// ─── Output Schemas ───

export const pageSchema = z.object({
  id: z.number().int(),
  slug: z.string(),
  title: z.string(),
  content: z.string(),
  isPublished: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const newsArticleSchema = z.object({
  id: z.number().int(),
  slug: z.string(),
  title: z.string(),
  content: z.string(),
  imageUrl: z.string().nullable(),
  isPublished: z.boolean(),
  publishedAt: z.date().nullable(),
  authorId: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// ─── Input Types ───

export type CreatePageInput = z.infer<typeof createPageSchema>;
export type CreateArticleInput = z.infer<typeof createArticleSchema>;
