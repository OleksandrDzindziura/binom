import { oc } from '@orpc/contract';
import { z } from 'zod';
import {
  createCallbackSchema,
  callbackSchema, callbackStatuses,
  paginatedOutput, successSchema,
} from '@repo/schemas';

export const callbacksContract = {
  create: oc
    .input(createCallbackSchema)
    .output(callbackSchema),
  list: oc
    .input(z.object({
      status: z.enum(callbackStatuses).optional(),
      page: z.number().int().positive().default(1),
      limit: z.number().int().positive().max(100).default(20),
    }))
    .output(paginatedOutput(callbackSchema)),
  updateStatus: oc
    .input(z.object({ id: z.number().int(), status: z.enum(callbackStatuses) }))
    .output(callbackSchema.nullable()),
  getById: oc
    .input(z.object({ id: z.number().int() }))
    .output(callbackSchema.nullable()),
};
