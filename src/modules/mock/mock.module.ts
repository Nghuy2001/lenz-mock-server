import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/core/prisma/prisma.module';
import { MockController } from './mock.controller';
import { MockService } from './mock.service';

@Module({
  imports: [PrismaModule],
  controllers: [MockController],
  providers: [MockService],
})
export class MockModule {}

