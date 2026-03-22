import { All, Controller, Req, Res } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { IncomingMessage, ServerResponse } from 'http';
import { toNodeHandler } from 'better-auth/node';
import { auth } from './auth.js';

const handler = toNodeHandler(auth);

@Throttle({ default: { ttl: 60000, limit: 10 } })
@Controller('auth')
export class AuthController {
  @All('*')
  async handleAuth(@Req() req: IncomingMessage, @Res() res: ServerResponse) {
    return handler(req, res);
  }
}
