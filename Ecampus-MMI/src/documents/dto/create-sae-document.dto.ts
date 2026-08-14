import { IsEnum, IsString } from 'class-validator';
import { DocumentType } from '@prisma/client';

export class CreateSaeDocumentDto {
  @IsString()
  url: string;

  @IsString()
  name: string;

  @IsString()
  mimeType: string;

  @IsEnum(DocumentType)
  type: DocumentType;
}
