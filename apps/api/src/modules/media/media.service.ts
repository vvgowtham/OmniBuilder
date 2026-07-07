import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class MediaService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(projectId?: string, mimeType?: string) {
    const where: any = {};
    if (projectId) where.projectId = projectId;
    if (mimeType) where.mimeType = { startsWith: mimeType };
    return this.prisma.mediaAsset.findMany({ where, orderBy: { createdAt: 'desc' } });
  }

  async findOne(id: string) {
    const asset = await this.prisma.mediaAsset.findUnique({ where: { id } });
    if (!asset) throw new NotFoundException('Media asset not found');
    return asset;
  }

  async create(data: { projectId: string; fileName: string; storageKey: string; mimeType: string; sizeBytes: number; width?: number; height?: number; altText?: string }) {
    return this.prisma.mediaAsset.create({ data });
  }

  async update(id: string, data: { altText?: string; fileName?: string }) {
    return this.prisma.mediaAsset.update({ where: { id }, data });
  }

  async remove(id: string) {
    return this.prisma.mediaAsset.delete({ where: { id } });
  }
}
