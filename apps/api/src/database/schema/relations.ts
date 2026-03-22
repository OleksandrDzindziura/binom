import { relations } from 'drizzle-orm';
import { users, sessions, accounts } from './auth.js';
import { projects, projectImages } from './catalog.js';
import { newsArticles } from './cms.js';

// ─── Auth Relations ───

export const usersRelations = relations(users, ({ many }) => ({
  sessions: many(sessions),
  accounts: many(accounts),
  newsArticles: many(newsArticles),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, { fields: [sessions.userId], references: [users.id] }),
}));

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, { fields: [accounts.userId], references: [users.id] }),
}));

// ─── Portfolio Relations ───

export const projectsRelations = relations(projects, ({ many }) => ({
  images: many(projectImages),
}));

export const projectImagesRelations = relations(projectImages, ({ one }) => ({
  project: one(projects, { fields: [projectImages.projectId], references: [projects.id] }),
}));

// ─── CMS Relations ───

export const newsArticlesRelations = relations(newsArticles, ({ one }) => ({
  author: one(users, { fields: [newsArticles.authorId], references: [users.id] }),
}));
