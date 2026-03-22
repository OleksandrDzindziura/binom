import 'dotenv/config';
import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from '../database/schema/index.js';

const pool = new Pool({ connectionString: process.env.DATABASE_URL! });
const db = drizzle(pool, { schema });

const isProduction = process.env.NODE_ENV === 'production';

const trustedOrigins = [
  'http://localhost:3001',
  process.env.WEB_URL?.replace(/\/+$/, ''),
].filter(Boolean) as string[];

export const auth = betterAuth({
  basePath: '/api/auth',
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema: {
      user: schema.users,
      session: schema.sessions,
      account: schema.accounts,
      verification: schema.verifications,
    },
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
    disableSignUp: true,
  },
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60,
    },
  },
  trustedOrigins,
  advanced: isProduction
    ? {
        defaultCookieAttributes: {
          sameSite: 'lax',
          secure: true,
        },
      }
    : {},
});

export type Auth = typeof auth;
