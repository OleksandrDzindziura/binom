import { Injectable } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import type { ExecutionContext } from '@nestjs/common';

@Injectable()
export class CloudflareThrottlerGuard extends ThrottlerGuard {
  protected async getTracker(req: Record<string, any>): Promise<string> {
    // Use real IP from Cloudflare header, fall back to direct connection IP
    return req.headers['cf-connecting-ip'] ?? req.ip ?? 'unknown';
  }
}
