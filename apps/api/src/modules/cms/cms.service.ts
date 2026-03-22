import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service.js';
import { newsArticles, pages } from '../../database/schema/index.js';
import { eq, and, desc, count } from 'drizzle-orm';

@Injectable()
export class CmsService {
  constructor(private db: DatabaseService) {}

  // ─── Pages ───
  async listPages(publishedOnly = false) {
    const conditions = publishedOnly ? [eq(pages.isPublished, true)] : [];
    return this.db.db
      .select()
      .from(pages)
      .where(conditions.length ? and(...conditions) : undefined)
      .orderBy(desc(pages.createdAt));
  }

  async getPageBySlug(slug: string) {
    const [page] = await this.db.db
      .select()
      .from(pages)
      .where(eq(pages.slug, slug));
    return page ?? null;
  }

  async createPage(data: typeof pages.$inferInsert) {
    const [page] = await this.db.db.insert(pages).values(data).returning();
    return page;
  }

  async updatePage(id: number, data: Partial<typeof pages.$inferInsert>) {
    const [page] = await this.db.db
      .update(pages)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(pages.id, id))
      .returning();
    return page ?? null;
  }

  async deletePage(id: number) {
    await this.db.db.delete(pages).where(eq(pages.id, id));
    return { success: true };
  }

  // ─── News Articles ───
  async listArticles(publishedOnly = true, limit = 20, offset = 0) {
    const conditions = publishedOnly ? [eq(newsArticles.isPublished, true)] : [];
    return this.db.db
      .select()
      .from(newsArticles)
      .where(conditions.length ? and(...conditions) : undefined)
      .orderBy(desc(newsArticles.publishedAt))
      .limit(limit)
      .offset(offset);
  }

  async getArticleBySlug(slug: string) {
    const [article] = await this.db.db
      .select()
      .from(newsArticles)
      .where(eq(newsArticles.slug, slug));
    return article ?? null;
  }

  async createArticle(data: typeof newsArticles.$inferInsert) {
    const values = {
      ...data,
      publishedAt: data.isPublished ? new Date() : undefined,
    };
    const [article] = await this.db.db.insert(newsArticles).values(values).returning();
    return article;
  }

  async updateArticle(id: number, data: Partial<typeof newsArticles.$inferInsert>) {
    const values: Record<string, unknown> = { ...data, updatedAt: new Date() };
    if (data.isPublished === true && !data.publishedAt) values.publishedAt = new Date();
    const [article] = await this.db.db
      .update(newsArticles)
      .set(values)
      .where(eq(newsArticles.id, id))
      .returning();
    return article ?? null;
  }

  async deleteArticle(id: number) {
    await this.db.db.delete(newsArticles).where(eq(newsArticles.id, id));
    return { success: true };
  }
}
