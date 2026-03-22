import { oc } from '@orpc/contract';
import { z } from 'zod';
import { UPLOAD_CATEGORIES, uploadResultSchema, successSchema } from '@repo/schemas';

export const uploadContract = {
  getUploadUrl: oc
    .input(z.object({
      filename: z.string(),
      category: z.enum(UPLOAD_CATEGORIES),
      contentType: z.string().default('application/octet-stream'),
    }))
    .output(uploadResultSchema),
  deleteFile: oc
    .input(z.object({ key: z.string() }))
    .output(successSchema),
};
