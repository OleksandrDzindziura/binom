import { Injectable, Logger } from '@nestjs/common';
import { auth } from '../auth/auth.js';
import { DatabaseService } from '../database/database.service.js';
import { users } from '../database/schema/index.js';
import { eq } from 'drizzle-orm';

export interface ORPCContext {
  user: {
    id: string;
    name: string;
    email: string;
    role: 'admin' | 'manager' | 'user';
    phone: string | null;
    preferredLanguage: string | null;
  } | null;
}

@Injectable()
export class ORPCContextFactory {
  private readonly logger = new Logger(ORPCContextFactory.name);

  constructor(private db: DatabaseService) {}

  async create(req: Request): Promise<ORPCContext> {
    try {
      const session = await auth.api.getSession({
        headers: req.headers as unknown as Headers,
      });
      if (!session?.user) return { user: null };

      const [dbUser] = await this.db.db
        .select({
          role: users.role,
          phone: users.phone,
          preferredLanguage: users.preferredLanguage,
        })
        .from(users)
        .where(eq(users.id, session.user.id));

      return {
        user: {
          id: session.user.id,
          name: session.user.name,
          email: session.user.email,
          role: (dbUser?.role as ORPCContext['user'] extends null ? never : NonNullable<ORPCContext['user']>['role']) ?? 'user',
          phone: dbUser?.phone ?? null,
          preferredLanguage: dbUser?.preferredLanguage ?? 'uk',
        },
      };
    } catch (err) {
      this.logger.error('Failed to create context', err instanceof Error ? err.stack : String(err));
      return { user: null };
    }
  }
}
