import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class ProjectsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: { name: string; description?: string; organizationId: string }) {
    const slug = dto.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now();
    return this.prisma.project.create({
      data: { name: dto.name, slug, description: dto.description, organizationId: dto.organizationId, createdById: userId },
    });
  }

  async findAll(organizationId: string) {
    return this.prisma.project.findMany({ where: { organizationId }, orderBy: { createdAt: 'desc' } });
  }

  async findOne(id: string) {
    const project = await this.prisma.project.findUnique({ where: { id }, include: { technologies: true } });
    if (!project) throw new NotFoundException('Project not found');
    return project;
  }

  async update(id: string, dto: any) { return this.prisma.project.update({ where: { id }, data: dto }); }
  async delete(id: string) { return this.prisma.project.delete({ where: { id } }); }
}
