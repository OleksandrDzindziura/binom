import { Injectable, Logger } from '@nestjs/common';
import { implement } from '@orpc/server';
import { ORPCError } from '@orpc/server';
import { uploadContract } from '@repo/contract';
import type { ORPCContext } from '../../orpc/orpc.context.js';
import { adminMiddleware } from '../../orpc/orpc.base.js';
import { randomUUID } from 'crypto';
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const ALLOWED_EXTENSIONS = new Set(['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg']);
const ALLOWED_CONTENT_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/svg+xml',
]);

const impl = implement(uploadContract).$context<ORPCContext>();

let r2Client: S3Client | null = null;

function getR2Client() {
  if (!r2Client) {
    r2Client = new S3Client({
      region: 'auto',
      endpoint: process.env.R2_ENDPOINT!,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID!,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
      },
    });
  }
  return r2Client;
}

function getPublicUrl(key: string) {
  return `${process.env.R2_PUBLIC_URL}/${key}`;
}

@Injectable()
export class UploadRouter {
  private readonly logger = new Logger(UploadRouter.name);

  get router() {
    return {
      getUploadUrl: impl.getUploadUrl.use(adminMiddleware).handler(async ({ input }) => {
        const ext = (input.filename.split('.').pop() ?? '').toLowerCase();
        if (!ALLOWED_EXTENSIONS.has(ext)) {
          throw new ORPCError('BAD_REQUEST', { message: `Недозволене розширення файлу: .${ext}. Дозволені: ${[...ALLOWED_EXTENSIONS].join(', ')}` });
        }
        if (!ALLOWED_CONTENT_TYPES.has(input.contentType)) {
          throw new ORPCError('BAD_REQUEST', { message: `Недозволений тип файлу: ${input.contentType}` });
        }
        const key = `${input.category}/${randomUUID()}.${ext}`;

        this.logger.log(`Generating upload URL for ${key}, bucket: ${process.env.R2_BUCKET}`);

        try {
          const command = new PutObjectCommand({
            Bucket: process.env.R2_BUCKET!,
            Key: key,
            ContentType: input.contentType,
          });

          const signedUrl = await getSignedUrl(getR2Client(), command, { expiresIn: 600 });

          return {
            key,
            uploadUrl: signedUrl,
            publicUrl: getPublicUrl(key),
          };
        } catch (err) {
          this.logger.error(`R2 signed URL failed: ${err}`);
          throw err;
        }
      }),

      deleteFile: impl.deleteFile.use(adminMiddleware).handler(async ({ input }) => {
        const command = new DeleteObjectCommand({
          Bucket: process.env.R2_BUCKET!,
          Key: input.key,
        });

        await getR2Client().send(command);
        return { success: true };
      }),
    };
  }
}
