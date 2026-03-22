import 'dotenv/config';
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL! });
await pool.query('DROP SCHEMA IF EXISTS drizzle CASCADE;');
await pool.query('DROP SCHEMA public CASCADE; CREATE SCHEMA public;');
await pool.end();
console.log('DB reset done');
