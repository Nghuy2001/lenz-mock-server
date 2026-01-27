import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { Observable, from, of } from 'rxjs';
import { switchMap, finalize } from 'rxjs/operators';

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
export class HttpLoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(HttpLoggingInterceptor.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) { }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    if (context.getType() !== 'http') {
      return next.handle();
    }
    const http = context.switchToHttp();
    const req = http.getRequest<Request & { originalUrl?: string; route?: any; baseUrl?: string }>();
    const res = http.getResponse<any>();

    const method = (req.method || 'UNKNOWN').toUpperCase();
    const url = req.originalUrl || (req as any)?.url || '';
    const start = Date.now();
    if (method === 'POST' && url === '/app/upload_json_file') {
      return next.handle().pipe(
        finalize(() => {
          const ms = Date.now() - start;
          this.logger.log(`${method} ${url} - ${ms}ms`);
        }),
      );
    }
    const authHeader = (req.headers as any)?.['authorization'] || (req.headers as any)?.['Authorization'];
    if (!authHeader) {
      return next.handle().pipe(
        finalize(() => {
          const ms = Date.now() - start;
          this.logger.log(`${method} ${url} - ${ms}ms`);
        }),
      );
    }

    const token = extractBearerToken(authHeader);
    if (!token) {
      return next.handle().pipe(
        finalize(() => {
          const ms = Date.now() - start;
          this.logger.log(`${method} ${url} - ${ms}ms`);
        }),
      );
    }
    let decoded: any;
    try {
      decoded = this.jwtService.verify(token);
    } catch {
      return next.handle().pipe(
        finalize(() => {
          const ms = Date.now() - start;
          this.logger.log(`${method} ${url} - ${ms}ms`);
        }),
      );
    }

    const userId = pickUserIdFromPayload(decoded);
    if (!userId) {
      return next.handle().pipe(
        finalize(() => {
          const ms = Date.now() - start;
          this.logger.log(`${method} ${url} - ${ms}ms`);
        }),
      );
    }
    const routePath = req.route?.path;
    const path = routePath ? `${req.baseUrl || ''}${routePath}` : url.split('?')[0];
    return from(
      this.prisma.mockResponse.findFirst({
        where: {
          userId,
          method,
          path,
        },
        orderBy: { createdAt: 'desc' },
      }),
    ).pipe(
      switchMap((mock) => {
        if (!mock) {
          return next.handle();
        }
        res.status(mock.statusCode ?? 200);
        this.logger.log(`[MOCK] ${method} ${url} - userId: ${userId} - ${Date.now() - start}ms`);
        return of(mock.response);
      }),
      finalize(() => {
        const ms = Date.now() - start;
        this.logger.log(`${method} ${url} - ${ms}ms`);
      }),
    );
  }
}

