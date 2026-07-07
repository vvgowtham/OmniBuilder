import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class ProjectsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: { name: string; description?: string; organizationId: string }) {
    const slug = dto.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now();
    const project = await this.prisma.project.create({
      data: {
        name: dto.name,
        slug,
        description: dto.description,
        organizationId: dto.organizationId,
        createdById: userId,
        status: 'ready',
      },
    });

    await this.prisma.projectEnvironment.create({
      data: { projectId: project.id, name: 'production', isDefault: true },
    });

    return project;
  }

  async findAll(organizationId?: string) {
    const where: any = {};
    if (organizationId) where.organizationId = organizationId;
    return this.prisma.project.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        _count: { select: { pages: true, components: true, mediaAssets: true } },
      },
    });
  }

  async findOne(id: string) {
    const project = await this.prisma.project.findUnique({
      where: { id },
      include: {
        technologies: true,
        environments: true,
        _count: { select: { pages: true, components: true, files: true, routes: true, mediaAssets: true } },
      },
    });
    if (!project) throw new NotFoundException('Project not found');
    return project;
  }

  async update(id: string, dto: any) {
    return this.prisma.project.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    // Cascade delete related data
    await this.prisma.pageNode.deleteMany({ where: { projectId: id } }).catch(() => {});
    await this.prisma.route.deleteMany({ where: { projectId: id } }).catch(() => {});
    await this.prisma.page.deleteMany({ where: { projectId: id } }).catch(() => {});
    await this.prisma.mediaAsset.deleteMany({ where: { projectId: id } }).catch(() => {});
    await this.prisma.component.deleteMany({ where: { projectId: id } }).catch(() => {});
    await this.prisma.projectEnvironment.deleteMany({ where: { projectId: id } }).catch(() => {});
    return this.prisma.project.delete({ where: { id } });
  }

  async duplicate(id: string, userId: string) {
    const source = await this.findOne(id);
    const newSlug = source.slug + '-copy-' + Date.now();
    return this.prisma.project.create({
      data: {
        name: source.name + ' (Copy)',
        slug: newSlug,
        description: source.description,
        organizationId: source.organizationId,
        detectedFramework: source.detectedFramework,
        detectedRuntime: source.detectedRuntime,
        detectedLanguage: source.detectedLanguage,
        status: source.status,
        createdById: userId,
      },
    });
  }
}
