import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service.js';
import { callbackRequests } from '../../database/schema/index.js';
import type { CallbackStatus } from '../../database/schema/callbacks.js';
import { eq, desc, and, count } from 'drizzle-orm';

@Injectable()
export class CallbacksService {
  constructor(private db: DatabaseService) {}

  async create(data: { name: string; phone: string; message?: string }) {
    const [request] = await this.db.db.insert(callbackRequests).values(data).returning();
    return request;
  }

  async list(status?: CallbackStatus, page = 1, limit = 20) {
    const conditions = [];
    if (status) conditions.push(eq(callbackRequests.status, status));
    const where = conditions.length ? and(...conditions) : undefined;

    const [items, [{ total }]] = await Promise.all([
      this.db.db
        .select()
        .from(callbackRequests)
        .where(where)
        .orderBy(desc(callbackRequests.createdAt))
        .limit(limit)
        .offset((page - 1) * limit),
      this.db.db.select({ total: count() }).from(callbackRequests).where(where),
    ]);

    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async updateStatus(id: number, status: CallbackStatus) {
    const [request] = await this.db.db
      .update(callbackRequests)
      .set({ status, updatedAt: new Date() })
      .where(eq(callbackRequests.id, id))
      .returning();
    return request ?? null;
  }

  async getById(id: number) {
    const [request] = await this.db.db
      .select()
      .from(callbackRequests)
      .where(eq(callbackRequests.id, id));
    return request ?? null;
  }
}
