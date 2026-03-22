import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema/index.js';

@Injectable()
export class DatabaseService implements OnModuleDestroy {
  public readonly db;
  private readonly pool: Pool;

  constructor(private config: ConfigService) {
    this.pool = new Pool({
      connectionString: this.config.getOrThrow('DATABASE_URL'),
    });
    this.db = drizzle(this.pool, { schema });
  }

  async onModuleDestroy() {
    await this.pool.end();
  }
}

export type Database = DatabaseService['db'];
