import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(1),
  phone: z.string().optional(),
  preferredLanguage: z.enum(['pl', 'en', 'de', 'ua']).default('pl'),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const updateProfileSchema = z.object({
  name: z.string().min(1).optional(),
  phone: z.string().optional(),
  preferredLanguage: z.enum(['pl', 'en', 'de', 'ua']).optional(),
  avatarUrl: z.string().url().optional(),
});
