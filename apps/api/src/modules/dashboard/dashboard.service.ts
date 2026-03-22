import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service.js';
import { projects } from '../../database/schema/catalog.js';
import { callbackRequests } from '../../database/schema/callbacks.js';
import { desc, count, sql } from 'drizzle-orm';

@Injectable()
export class DashboardService {
  constructor(private db: DatabaseService) {}

  async getStats() {
    const [projectStats, callbackStats, recentProjects] = await Promise.all([
      this.getProjectStats(),
      this.getCallbackStats(),
      this.getRecentProjects(),
    ]);

    return {
      projects: projectStats,
      callbacks: callbackStats,
      recentProjects,
    };
  }

  private async getProjectStats() {
    const rows = await this.db.db
      .select({
        total: count(),
        published: count(sql`CASE WHEN ${projects.isPublished} = true AND ${projects.isArchived} = false THEN 1 END`),
        unpublished: count(sql`CASE WHEN ${projects.isPublished} = false AND ${projects.isArchived} = false THEN 1 END`),
        archived: count(sql`CASE WHEN ${projects.isArchived} = true THEN 1 END`),
        kitchen: count(sql`CASE WHEN ${projects.category} = 'kitchen' THEN 1 END`),
        wardrobe: count(sql`CASE WHEN ${projects.category} = 'wardrobe' THEN 1 END`),
        bathroom: count(sql`CASE WHEN ${projects.category} = 'bathroom' THEN 1 END`),
        office: count(sql`CASE WHEN ${projects.category} = 'office' THEN 1 END`),
        other: count(sql`CASE WHEN ${projects.category} = 'other' THEN 1 END`),
      })
      .from(projects);

    const r = rows[0];
    return {
      total: r.total,
      published: r.published,
      unpublished: r.unpublished,
      archived: r.archived,
      byCategory: {
        kitchen: r.kitchen,
        wardrobe: r.wardrobe,
        bathroom: r.bathroom,
        office: r.office,
        other: r.other,
      },
    };
  }

  private async getCallbackStats() {
    const rows = await this.db.db
      .select({
        total: count(),
        new: count(sql`CASE WHEN ${callbackRequests.status} = 'new' THEN 1 END`),
        contacted: count(sql`CASE WHEN ${callbackRequests.status} = 'contacted' THEN 1 END`),
        closed: count(sql`CASE WHEN ${callbackRequests.status} = 'closed' THEN 1 END`),
      })
      .from(callbackRequests);

    const r = rows[0];
    return {
      total: r.total,
      byStatus: {
        new: r.new,
        contacted: r.contacted,
        closed: r.closed,
      },
      recent: await this.getRecentCallbacks(),
    };
  }

  private async getRecentCallbacks() {
    return this.db.db
      .select({
        id: callbackRequests.id,
        name: callbackRequests.name,
        phone: callbackRequests.phone,
        message: callbackRequests.message,
        status: callbackRequests.status,
        createdAt: callbackRequests.createdAt,
      })
      .from(callbackRequests)
      .orderBy(desc(callbackRequests.createdAt))
      .limit(5);
  }

  private async getRecentProjects() {
    return this.db.db
      .select({
        id: projects.id,
        title: projects.title,
        category: projects.category,
        isPublished: projects.isPublished,
        createdAt: projects.createdAt,
      })
      .from(projects)
      .orderBy(desc(projects.createdAt))
      .limit(5);
  }
}
