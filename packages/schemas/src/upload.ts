import { z } from 'zod';

/** Prefix segment in R2 object keys: `{category}/{uuid}.{ext}` */
export const UPLOAD_CATEGORIES = [
  'project_photo',
  'page_image',
  'article_image',
  'logo',
] as const;

export const uploadResultSchema = z.object({
  key: z.string(),
  uploadUrl: z.string(),
  publicUrl: z.string(),
});

export type UploadResult = z.infer<typeof uploadResultSchema>;
