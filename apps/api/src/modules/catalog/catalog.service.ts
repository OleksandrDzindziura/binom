import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service.js';
import { projects, projectImages } from '../../database/schema/index.js';
import type { ProjectCategory } from '../../database/schema/catalog.js';
import { eq, and, desc, asc, count } from 'drizzle-orm';
import { S3Client, DeleteObjectCommand } from '@aws-sdk/client-s3';

function getR2Client() {
  return new S3Client({
    region: 'auto',
    endpoint: process.env.R2_ENDPOINT!,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID!,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
    },
  });
}

function extractR2Key(url: string): string | null {
  const publicUrl = process.env.R2_PUBLIC_URL;
  if (publicUrl && url.startsWith(publicUrl)) {
    return url.slice(publicUrl.length + 1);
  }
  return null;
}

@Injectable()
export class CatalogService {
  constructor(private db: DatabaseService) {}

  // ─── Projects ───

  async listProjects(filters: {
    category?: ProjectCategory;
    isFeatured?: boolean;
    isArchived?: boolean;
    publishedOnly?: boolean;
    page?: number;
    limit?: number;
  }) {
    const { page = 1, limit = 12, publishedOnly = true, isArchived, ...f } = filters;
    const conditions = [];

    if (publishedOnly) conditions.push(eq(projects.isPublished, true));
    if (f.category) conditions.push(eq(projects.category, f.category));
    if (f.isFeatured !== undefined) conditions.push(eq(projects.isFeatured, f.isFeatured));
    if (isArchived !== undefined) conditions.push(eq(projects.isArchived, isArchived));
    if (isArchived === undefined) conditions.push(eq(projects.isArchived, false));

    const where = conditions.length ? and(...conditions) : undefined;

    const [rawItems, [{ total }]] = await Promise.all([
      this.db.db
        .select()
        .from(projects)
        .where(where)
        .orderBy(desc(projects.createdAt))
        .limit(limit)
        .offset((page - 1) * limit),
      this.db.db.select({ total: count() }).from(projects).where(where),
    ]);

    const items = await Promise.all(
      rawItems.map(async (project) => {
        const [mainImage] = await this.db.db
          .select()
          .from(projectImages)
          .where(and(eq(projectImages.projectId, project.id), eq(projectImages.isMain, true)))
          .limit(1);
        const image = mainImage
          ?? (await this.db.db.select().from(projectImages).where(eq(projectImages.projectId, project.id)).orderBy(asc(projectImages.order)).limit(1))[0]
          ?? null;

        return { ...project, imageUrl: image?.url ?? null };
      }),
    );

    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async getProjectById(id: number) {
    const [project] = await this.db.db.select().from(projects).where(eq(projects.id, id));
    if (!project) return null;

    const images = await this.db.db
      .select()
      .from(projectImages)
      .where(eq(projectImages.projectId, id))
      .orderBy(asc(projectImages.order));

    return { ...project, images };
  }

  async createProject(data: typeof projects.$inferInsert) {
    const [project] = await this.db.db.insert(projects).values(data).returning();
    return project;
  }

  async updateProject(id: number, data: Partial<typeof projects.$inferInsert>) {
    const [project] = await this.db.db
      .update(projects)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(projects.id, id))
      .returning();
    return project ?? null;
  }

  async deleteProject(id: number) {
    const images = await this.db.db.select().from(projectImages).where(eq(projectImages.projectId, id));
    const r2 = getR2Client();
    for (const img of images) {
      const key = extractR2Key(img.url);
      if (key) {
        try {
          await r2.send(new DeleteObjectCommand({ Bucket: process.env.R2_BUCKET!, Key: key }));
        } catch {}
      }
    }

    await this.db.db.delete(projectImages).where(eq(projectImages.projectId, id));
    await this.db.db.delete(projects).where(eq(projects.id, id));
    return { success: true };
  }

  async archiveProject(id: number) {
    const [project] = await this.db.db
      .update(projects)
      .set({ isArchived: true, isPublished: false })
      .where(eq(projects.id, id))
      .returning();
    return project;
  }

  async unarchiveProject(id: number) {
    const [project] = await this.db.db
      .update(projects)
      .set({ isArchived: false, isPublished: true })
      .where(eq(projects.id, id))
      .returning();
    return project;
  }

  // ─── Project Images ───

  async addProjectImage(data: { projectId: number; url: string; order: number; isMain?: boolean }) {
    if (data.isMain) {
      await this.db.db.update(projectImages).set({ isMain: false }).where(eq(projectImages.projectId, data.projectId));
    }
    const [image] = await this.db.db.insert(projectImages).values(data).returning();
    return image;
  }

  async deleteProjectImage(id: number) {
    const [img] = await this.db.db.select().from(projectImages).where(eq(projectImages.id, id));
    if (img) {
      const key = extractR2Key(img.url);
      if (key) {
        try {
          const r2 = getR2Client();
          await r2.send(new DeleteObjectCommand({ Bucket: process.env.R2_BUCKET!, Key: key }));
        } catch {}
      }
    }
    await this.db.db.delete(projectImages).where(eq(projectImages.id, id));
    return { success: true };
  }

  async setMainImage(imageId: number, projectId: number) {
    await this.db.db.update(projectImages).set({ isMain: false }).where(eq(projectImages.projectId, projectId));
    const [image] = await this.db.db.update(projectImages).set({ isMain: true }).where(eq(projectImages.id, imageId)).returning();
    return image ?? null;
  }

  async reorderImages(projectId: number, imageIds: number[]) {
    for (let i = 0; i < imageIds.length; i++) {
      await this.db.db.update(projectImages).set({ order: i }).where(and(eq(projectImages.id, imageIds[i]), eq(projectImages.projectId, projectId)));
    }
    return { success: true };
  }
}
