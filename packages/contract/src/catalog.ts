import { oc } from '@orpc/contract';
import { z } from 'zod';
import {
  createProjectSchema, updateProjectSchema, projectFiltersSchema,
  projectSchema, projectImageSchema, projectListItemSchema, projectDetailSchema,
  successSchema, paginatedOutput,
} from '@repo/schemas';

export const catalogContract = {
  projects: {
    list: oc
      .input(projectFiltersSchema)
      .output(paginatedOutput(projectListItemSchema)),
    getById: oc
      .input(z.object({ id: z.number().int() }))
      .output(projectDetailSchema.nullable()),
    create: oc
      .input(createProjectSchema)
      .output(projectSchema),
    update: oc
      .input(z.object({ id: z.number().int(), data: updateProjectSchema }))
      .output(projectSchema.nullable()),
    delete: oc
      .input(z.object({ id: z.number().int() }))
      .output(successSchema),
    archive: oc
      .input(z.object({ id: z.number().int() }))
      .output(projectSchema),
    unarchive: oc
      .input(z.object({ id: z.number().int() }))
      .output(projectSchema),
  },
  images: {
    add: oc
      .input(z.object({
        projectId: z.number().int(),
        url: z.string(),
        order: z.number().int().default(0),
        isMain: z.boolean().default(false),
      }))
      .output(projectImageSchema),
    delete: oc
      .input(z.object({ id: z.number().int() }))
      .output(successSchema),
    setMain: oc
      .input(z.object({ imageId: z.number().int(), projectId: z.number().int() }))
      .output(projectImageSchema.nullable()),
    reorder: oc
      .input(z.object({ projectId: z.number().int(), imageIds: z.array(z.number().int()) }))
      .output(successSchema),
  },
};
