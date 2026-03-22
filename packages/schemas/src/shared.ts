import { z } from 'zod';

export const successSchema = z.object({
  success: z.boolean(),
});

export function paginatedOutput<T extends z.ZodTypeAny>(itemSchema: T) {
  return z.object({
    items: z.array(itemSchema),
    total: z.number().int(),
    page: z.number().int(),
    limit: z.number().int(),
    totalPages: z.number().int(),
  });
}

export type Success = z.infer<typeof successSchema>;
