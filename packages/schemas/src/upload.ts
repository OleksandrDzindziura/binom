import { z } from 'zod';

export const UPLOAD_CATEGORIES = ['car_photo', 'news_image', 'page_image', 'make_logo'] as const;

export const uploadResultSchema = z.object({
  key: z.string(),
  uploadUrl: z.string(),
  publicUrl: z.string(),
});

export type UploadResult = z.infer<typeof uploadResultSchema>;
