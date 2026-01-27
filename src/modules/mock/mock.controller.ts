import {
  BadRequestException,
  Body,
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadMockDto } from './dto/upload-mock.dto';
import { MockService } from './mock.service';

@Controller('app')
export class MockController {
  constructor(private readonly mockService: MockService) {}
  
  @Post('/upload_json_file')
  @UseInterceptors(FileInterceptor('file'))
  async uploadJsonFile(
    @UploadedFile() file: any,
    @Body() body: Partial<UploadMockDto>,
  ) {
    if (!file) {
      throw new BadRequestException('Missing file field "file"');
    }
    let parsed: any;
    try {
      parsed = JSON.parse(file.buffer.toString('utf8'));
    } catch {
      throw new BadRequestException('Uploaded file is not valid JSON');
    }
    const fileName = (file.originalname || '').replace(/\.[^.]+$/, '');
    if (!fileName) {
      throw new BadRequestException('File name is required');
    }
    if (!parsed.userId) {
      throw new BadRequestException('userId is required in JSON');
    }
    if (!parsed.path) {
      throw new BadRequestException('path is required in JSON');
    }
    if (!parsed.method) {
      throw new BadRequestException('method is required in JSON');
    }
    if (!parsed.response) {
      throw new BadRequestException('response is required in JSON');
    }

    const dto: UploadMockDto & { fileName: string } = {
      ...parsed,
      ...body,
      fileName,
    };

    return this.mockService.upsertMock(dto);
  }
}

