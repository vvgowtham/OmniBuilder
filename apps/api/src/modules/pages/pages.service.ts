import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class PagesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(projectId?: string, status?: string, search?: string) {
    const where: any = {};
    if (projectId) where.projectId = projectId;
    if (status) where.status = status;
    if (search) where.title = { contains: search, mode: 'insensitive' };

    return this.prisma.page.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
      include: { routes: { select: { path: true } } },
    });
  }

  async findOne(id: string) {
    const page = await this.prisma.page.findUnique({
      where: { id },
      include: { routes: true, nodes: { orderBy: { sortOrder: 'asc' } } },
    });
    if (!page) throw new NotFoundException('Page not found');
    return page;
  }

  async create(data: { projectId: string; title: string; slug?: string; pageType?: string; seoTitle?: string; seoDesc?: string }) {
    const slug = data.slug || data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const page = await this.prisma.page.create({
      data: {
        projectId: data.projectId,
        title: data.title,
        slug,
        pageType: data.pageType || 'static',
        status: 'draft',
        seoTitle: data.seoTitle,
        seoDesc: data.seoDesc,
      },
    });

    await this.prisma.route.create({
      data: { projectId: data.projectId, path: '/' + slug, routeName: slug, pageId: page.id },
    }).catch(() => {});

    return page;
  }

  async update(id: string, data: { title?: string; slug?: string; status?: string; seoTitle?: string; seoDesc?: string }) {
    return this.prisma.page.update({ where: { id }, data });
  }

  async remove(id: string) {
    await this.prisma.route.deleteMany({ where: { pageId: id } }).catch(() => {});
    await this.prisma.pageNode.deleteMany({ where: { pageId: id } }).catch(() => {});
    return this.prisma.page.delete({ where: { id } });
  }

  async publish(id: string) {
    return this.prisma.page.update({ where: { id }, data: { status: 'published' } });
  }

  async unpublish(id: string) {
    return this.prisma.page.update({ where: { id }, data: { status: 'draft' } });
  }
}
