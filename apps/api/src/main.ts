import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { AppModule } from './app.module.js';
import { AppRouter } from './app.router.js';
import { ORPCContextFactory } from './orpc/orpc.context.js';
import { OpenAPIGenerator } from '@orpc/openapi';
import { ZodToJsonSchemaConverter } from '@orpc/zod';
import { apiReference } from '@scalar/nestjs-api-reference';
import { RPCHandler } from '@orpc/server/node';
import { AllExceptionsFilter } from './common/all-exceptions.filter.js';
import helmet from 'helmet';

const logger = new Logger('Bootstrap');

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug', 'verbose'],
  });

  app.useGlobalFilters(new AllExceptionsFilter());

  app.use(helmet({ crossOriginEmbedderPolicy: false }));

  const corsOrigins = [
    'http://localhost:3001',
    process.env.WEB_URL?.replace(/\/+$/, ''),
  ].filter(Boolean) as string[];

  app.enableCors({
    origin: corsOrigins,
    credentials: true,
  });

  app.setGlobalPrefix('api');

  // Manual CORS for raw Express middleware (app.use bypasses NestJS pipeline)
  const expressApp = app.getHttpAdapter().getInstance();
  expressApp.use((req: any, res: any, next: any) => {
    const origin = req.headers.origin;
    if (origin && corsOrigins.includes(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Access-Control-Allow-Credentials', 'true');
      res.setHeader('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization,Accept');
    }
    if (req.method === 'OPTIONS') {
      return res.status(204).end();
    }
    next();
  });

  const appRouter = app.get(AppRouter);
  const contextFactory = app.get(ORPCContextFactory);

  // Mount oRPC handler at /api/rpc
  const rpcHandler = new RPCHandler(appRouter.router);
  app.use('/api/rpc', async (req: any, res: any, next: any) => {
    const start = Date.now();

    const originalWriteHead = res.writeHead.bind(res);
    res.writeHead = (statusCode: number, ...args: any[]) => {
      const duration = Date.now() - start;
      if (statusCode >= 500) {
        logger.error(`${req.method} ${req.url} → ${statusCode} (${duration}ms)`);
      } else if (statusCode >= 400) {
        logger.warn(`${req.method} ${req.url} → ${statusCode} (${duration}ms)`);
      } else {
        logger.log(`${req.method} ${req.url} → ${statusCode} (${duration}ms)`);
      }
      return originalWriteHead(statusCode, ...args);
    };

    const originalEnd = res.end.bind(res);
    res.end = (chunk: any, ...args: any[]) => {
      if (res.statusCode >= 400 && chunk) {
        try {
          const body = typeof chunk === 'string' ? chunk : chunk.toString('utf-8');
          logger.error(`Response body: ${body}`);
        } catch {}
      }
      return originalEnd(chunk, ...args);
    };

    try {
      const context = await contextFactory.create(req);
      const { matched } = await rpcHandler.handle(req, res, {
        context,
        prefix: '/api/rpc',
      });
      if (!matched) next();
    } catch (err) {
      logger.error(`oRPC unhandled: ${req.method} ${req.url}`, err instanceof Error ? err.stack : String(err));
      if (!res.headersSent) {
        res.status(500).json({ message: 'Internal server error', error: err instanceof Error ? err.message : String(err) });
      }
    }
  });

  // Generate OpenAPI spec
  const generator = new OpenAPIGenerator({
    schemaConverters: [new ZodToJsonSchemaConverter()],
  });

  const spec = await generator.generate(appRouter.router, {
    info: { title: 'AV SALON RV API', version: '1.0.0', description: 'Car dealership platform — AV SALON RV' },
    servers: [{ url: 'http://localhost:3000' }],
  });

  const port = process.env.PORT ?? 3000;

  if (process.env.ENABLE_DOCS === 'true') {
    app.use('/docs', apiReference({ content: spec }));
    console.log(`API docs at http://localhost:${port}/docs`);
  }

  await app.listen(port);

  console.log(`API running at http://localhost:${port}`);
}

bootstrap();
