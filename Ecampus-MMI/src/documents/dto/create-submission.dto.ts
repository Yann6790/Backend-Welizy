import { IsString, IsOptional, IsBoolean } from 'class-validator';

export class CreateSubmissionDto {
  @IsString()
  url: string;

  @IsString()
  fileName: string;

  @IsString()
  mimeType: string;

  @IsString()
  description: string;

  @IsString()
  @IsOptional()
  imageUrl?: string;

  @IsBoolean()
  @IsOptional()
  isPublic?: boolean;
}
