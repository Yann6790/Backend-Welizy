import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { UTApi } from 'uploadthing/server';
import { DocumentsService } from '../documents/documents.service';
import {
  SaeDocumentResponse,
  StudentSubmissionResponse,
} from '../documents/types/document.types';
import { PrismaService } from '../prisma/prisma.service';
import { UploadResourceDto } from './dto/upload-resource.dto';
import {
  BannerResponse,
  GroupResponse,
  PromotionResponse,
  SemesterResponse,
  ThematicResponse,
} from './types/resource.types';

@Injectable()
export class ResourcesService {
  private readonly utapi = new UTApi();

  constructor(
    private readonly prisma: PrismaService,
    private readonly documentsService: DocumentsService,
  ) {}

  async findBanners(): Promise<BannerResponse[]> {
    return this.prisma.banner.findMany({
      orderBy: { createdAt: 'asc' },
    });
  }

  async uploadAndRegister(
    file: Express.Multer.File,
    dto: UploadResourceDto,
    userId: string,
    role: UserRole,
  ): Promise<StudentSubmissionResponse | SaeDocumentResponse> {
    if (!file) throw new BadRequestException('Aucun fichier fourni');

    const sae = await this.prisma.sae.findUnique({
      where: { id: dto.saeId, deletedAt: null },
    });
    if (!sae) throw new BadRequestException('SAE non trouvée');

    let fileUrl = '';
    let fileName = file.originalname;
    let fileKey: string | null = null;

    try {
      if (process.env.UPLOADTHING_TOKEN) {
        const uploadResult = await this.utapi.uploadFiles(
          new File([new Uint8Array(file.buffer)], file.originalname, {
            type: file.mimetype,
          }),
        );
        if (uploadResult?.data?.url) {
          fileUrl = uploadResult.data.url;
          fileName = uploadResult.data.name || file.originalname;
          fileKey = uploadResult.data.key;
        }
      }
    } catch (error) {
      console.warn('[ResourcesService] UploadThing a échoué:', error?.message);
    }

    if (!fileUrl) {
      const base64 = file.buffer.toString('base64');
      fileUrl = `data:${file.mimetype};base64,${base64}`;
    }

    try {
      if (role === UserRole.STUDENT) {
        if (!dto.description) {
          throw new BadRequestException(
            'La description est obligatoire pour un rendu',
          );
        }

        return await this.documentsService.submitDocument(
          dto.saeId,
          {
            url: fileUrl,
            fileName: fileName,
            mimeType: file.mimetype,
            description: dto.description,
            imageUrl: dto.imageUrl,
          },
          userId,
        );
      } else {
        return await this.documentsService.addSaeDocument(
          dto.saeId,
          {
            url: fileUrl,
            name: fileName,
            mimeType: file.mimetype,
            type: dto.type || 'RESOURCE',
          },
          userId,
        );
      }
    } catch (error) {
      if (fileKey) {
        try {
          await this.utapi.deleteFiles(fileKey);
        } catch {}
      }
      throw error;
    }
  }

  async uploadProfileImage(
    file: Express.Multer.File,
  ): Promise<{ url: string }> {
    if (!file) throw new BadRequestException('Aucun fichier fourni');

    const allowedMimeTypes = [
      'image/png',
      'image/jpeg',
      'image/jpg',
      'image/webp',
    ];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        'Format de fichier non supporté. Utilisez PNG, JPG, JPEG ou WEBP.',
      );
    }

    try {
      if (process.env.UPLOADTHING_TOKEN) {
        const uploadResult = await this.utapi.uploadFiles(
          new File([new Uint8Array(file.buffer)], file.originalname, {
            type: file.mimetype,
          }),
        );

        if (uploadResult?.data?.url) {
          return { url: uploadResult.data.url };
        }
      }
    } catch (error) {
      console.warn('[ResourcesService] UploadThing profile upload failed:', error?.message);
    }

    // Fallback Data URL
    const base64 = file.buffer.toString('base64');
    return { url: `data:${file.mimetype};base64,${base64}` };
  }

  async findAllPromotions(): Promise<PromotionResponse[]> {
    return this.prisma.promotion.findMany({
      where: { isActive: true },
      orderBy: { label: 'asc' },
    });
  }

  async findAllGroups(): Promise<GroupResponse[]> {
    return this.prisma.group.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async findAllSemesters(): Promise<SemesterResponse[]> {
    return this.prisma.semester.findMany({
      orderBy: [{ promotionId: 'asc' }, { number: 'asc' }],
      include: {
        promotion: {
          select: { label: true },
        },
      },
    });
  }

  async findAllThematics(): Promise<ThematicResponse[]> {
    return this.prisma.thematic.findMany({
      select: {
        id: true,
        code: true,
        label: true,
      },
      orderBy: { label: 'asc' },
    });
  }
}
