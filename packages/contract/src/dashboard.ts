import { oc } from '@orpc/contract';
import { z } from 'zod';

const recentCallbackSchema = z.object({
  id: z.number(),
  name: z.string(),
  phone: z.string(),
  message: z.string().nullable(),
  status: z.string(),
  createdAt: z.date(),
});

const recentProjectSchema = z.object({
  id: z.number(),
  title: z.string(),
  category: z.string(),
  isPublished: z.boolean(),
  createdAt: z.date(),
});

const dashboardStatsSchema = z.object({
  projects: z.object({
    total: z.number(),
    published: z.number(),
    unpublished: z.number(),
    archived: z.number(),
    byCategory: z.record(z.string(), z.number()),
  }),
  callbacks: z.object({
    total: z.number(),
    byStatus: z.object({
      new: z.number(),
      contacted: z.number(),
      closed: z.number(),
    }),
    recent: z.array(recentCallbackSchema),
  }),
  recentProjects: z.array(recentProjectSchema),
});

export const dashboardContract = {
  stats: oc
    .input(z.object({}))
    .output(dashboardStatsSchema),
};
