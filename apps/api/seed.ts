import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { users, accounts, type UserRole } from './src/database/schema/index.js';
import { eq } from 'drizzle-orm';
import { auth } from './src/auth/auth.js';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool);

async function seed() {
  console.log('Seeding...');

  const testUsers: { email: string; name: string; role: UserRole }[] = [
    { email: 'admin@binom-mebli.com', name: 'Admin', role: 'admin' },
    { email: 'manager@binom-mebli.com', name: 'Manager', role: 'manager' },
  ];

  for (const u of testUsers) {
    const existing = await db.select().from(users).where(eq(users.email, u.email));
    if (existing.length > 0) {
      console.log(`User ${u.email} already exists, skipping`);
      continue;
    }

    await auth.api.signUpEmail({
      body: { email: u.email, password: 'password123', name: u.name },
    });

    await db.update(users).set({ role: u.role }).where(eq(users.email, u.email));
    console.log(`Created ${u.role}: ${u.email}`);
  }

  console.log('Seed complete!');
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
