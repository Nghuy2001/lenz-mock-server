import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AuthModule } from './modules/auth/auth.module';
import { PrismaModule } from './core/prisma/prisma.module';
import { MockModule } from './modules/mock/mock.module';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { HttpLoggingInterceptor } from './core/interceptors/http-logging.interceptor';
import { MockDbResponseMiddleware } from './core/middlewares/mock-db-response.middleware';

@Module({
  imports: [PrismaModule, AuthModule, MockModule],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: HttpLoggingInterceptor,
    },
    MockDbResponseMiddleware,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(MockDbResponseMiddleware).forRoutes('*');
  }
}
