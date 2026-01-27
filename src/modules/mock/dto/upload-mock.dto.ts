import { IsInt, IsObject, IsOptional, IsString, Min } from 'class-validator';

export class UploadMockDto {
  @IsOptional()
  @IsString()
  fileName?: string;

  @IsString()
  userId: string;

  @IsString()
  path: string;

  @IsString()
  method: string;

  @IsOptional()
  @IsInt()
  @Min(100)
  statusCode?: number;

  @IsObject()
  response: Record<string, any>;
}

