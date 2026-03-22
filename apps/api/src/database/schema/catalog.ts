import {
  pgTable, text, timestamp, boolean, integer, serial,
} from 'drizzle-orm/pg-core';

// ─── Portfolio ───

export const projects = pgTable('projects', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description'),
  category: text('category', {
    enum: ['kitchen', 'wardrobe', 'bathroom', 'office', 'other'],
  }).notNull().default('kitchen'),
  isPublished: boolean('is_published').notNull().default(false),
  isFeatured: boolean('is_featured').notNull().default(false),
  isArchived: boolean('is_archived').notNull().default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const projectImages = pgTable('project_images', {
  id: serial('id').primaryKey(),
  projectId: integer('project_id').references(() => projects.id, { onDelete: 'cascade' }).notNull(),
  url: text('url').notNull(),
  order: integer('order').notNull().default(0),
  isMain: boolean('is_main').notNull().default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export type ProjectCategory = NonNullable<typeof projects.$inferSelect['category']>;
