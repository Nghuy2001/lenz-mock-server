import { Injectable } from '@nestjs/common';
import { UploadMockDto } from './dto/upload-mock.dto';
import { PrismaService } from 'src/core/prisma/prisma.service';

@Injectable()
export class MockService {
  constructor(private readonly prisma: PrismaService) {}

  async upsertMock(dto: UploadMockDto & { fileName: string }) {
    const fileName = dto.fileName;
    const userId = dto.userId;
    const path = dto.path;
    const method = dto.method.toUpperCase();
    const statusCode = dto.statusCode ?? 200;

    const existing = await this.prisma.mockResponse.findFirst({
      where: {
        method,
        userId,
        path,
      },
    });

    if (existing) {
      return this.prisma.mockResponse.update({
        where: { id: existing.id },
        data: {
          fileName,
          statusCode,
          response: dto.response,
        },
        select: {
          id: true,
          fileName: true,
          userId: true,
          statusCode: true,
          path: true,
          method: true,
          response: true,
          createdAt: true,
        },
      });
    }
    return this.prisma.mockResponse.create({
      data: {
        fileName,
        userId,
        path,
        method,
        statusCode,
        response: dto.response,
      },
      select: {
        id: true,
        fileName: true,
        userId: true,
        statusCode: true,
        path: true,
        method: true,
        response: true,
        createdAt: true,
      },
    });
  }
}

