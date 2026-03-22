import { z } from 'zod';

export const callbackStatuses = ['new', 'contacted', 'closed'] as const;

export const createCallbackSchema = z.object({
  name: z.string().min(1).max(100),
  phone: z.string().min(9).max(20),
  message: z.string().max(1000).optional(),
});

export const callbackSchema = z.object({
  id: z.number().int(),
  name: z.string(),
  phone: z.string(),
  message: z.string().nullable(),
  status: z.enum(callbackStatuses),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type CreateCallbackInput = z.infer<typeof createCallbackSchema>;
