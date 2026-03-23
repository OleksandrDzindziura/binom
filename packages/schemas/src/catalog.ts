import { z } from 'zod';

export const projectCategories = ['кухня', 'шафа', 'ванна', 'офіс', 'інше'] as const;

export const createProjectSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().optional(),
  category: z.enum(projectCategories).default('кухня'),
  isPublished: z.boolean().default(false),
  isFeatured: z.boolean().default(false),
});

export const updateProjectSchema = createProjectSchema.partial();

export const projectFiltersSchema = z.object({
  category: z.enum(projectCategories).optional(),
  isFeatured: z.boolean().optional(),
  isArchived: z.boolean().optional(),
  publishedOnly: z.boolean().default(true),
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(12),
});

// ─── Output Schemas ───

export const projectSchema = z.object({
  id: z.number().int(),
  title: z.string(),
  description: z.string().nullable(),
  category: z.enum(projectCategories),
  isPublished: z.boolean(),
  isFeatured: z.boolean(),
  isArchived: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const projectImageSchema = z.object({
  id: z.number().int(),
  projectId: z.number().int(),
  url: z.string(),
  order: z.number().int(),
  isMain: z.boolean(),
  createdAt: z.date(),
});

export const projectListItemSchema = projectSchema.extend({
  imageUrl: z.string().nullable(),
});

export const projectDetailSchema = projectSchema.extend({
  images: z.array(projectImageSchema),
});

// ─── Input Types ───

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
export type ProjectFilters = z.infer<typeof projectFiltersSchema>;
