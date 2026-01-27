import { Injectable, NestMiddleware } from '@nestjs/common';
import type { NextFunction, Request, Response } from 'express';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';

function extractBearerToken(authHeader?: string): string | undefined {
  if (!authHeader) return undefined;
  const [type, token] = authHeader.split(' ');
  if (!token) return undefined;
  if (type?.toLowerCase() !== 'bearer') return undefined;
  return token;
}

function pickUserIdFromPayload(payload: any): string | undefined {
  const v = payload?.userId ?? payload?.user_id ?? payload?.id ?? payload?.sub;
  return typeof v === 'string' && v.length > 0 ? v : undefined;
}

@Injectable()
export class MockDbResponseMiddleware implements NestMiddleware {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) { }

  async use(req: Request, res: Response, next: NextFunction) {
    const fullPath = (req as any).originalUrl || req.url || req.path;
    const path = fullPath.split('?')[0];
    
    if (req.method === 'POST' && path === '/app/upload_json_file') {
      return next();
    }
    if (req.method === 'POST' && path === '/app/user_register/member') {
      return next();
    }

    const authHeader = req.header('authorization') || req.header('Authorization');
    if (!authHeader) {
      return next();
    }

    const token = extractBearerToken(authHeader);
    if (!token) {
      return res.status(401).json({
        message: 'The incoming token has expired',
      });
    }

    let decoded: any;
    try {
      decoded = this.jwtService.verify(token);
    } catch (error) {
      return res.status(401).json({
        message: 'The incoming token has expired',
      });
    }

    const userId = pickUserIdFromPayload(decoded);
    if (!userId) {
      console.log('[MIDDLEWARE] No userId found in token payload');
      return next();
    }
    const method = req.method.toUpperCase();
    console.log('[MIDDLEWARE] Checking DB - userId:', userId, 'method:', method, 'path:', path);
    
    const mock = await this.prisma.mockResponse.findFirst({
      where: {
        userId,
        method,
        path,
      },
      orderBy: { createdAt: 'desc' },
    });
    if (mock) {
      return res.status(mock.statusCode ?? 200).json(mock.response);
    }

    return next();
  }
}

