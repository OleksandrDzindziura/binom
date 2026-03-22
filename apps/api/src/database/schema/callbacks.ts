import {
  pgTable, text, timestamp, integer, serial,
} from 'drizzle-orm/pg-core';

// ─── Callback Requests ───

export const callbackRequests = pgTable('callback_requests', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  phone: text('phone').notNull(),
  message: text('message'),
  status: text('status', {
    enum: ['new', 'contacted', 'closed'],
  }).notNull().default('new'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export type CallbackStatus = NonNullable<typeof callbackRequests.$inferSelect['status']>;
