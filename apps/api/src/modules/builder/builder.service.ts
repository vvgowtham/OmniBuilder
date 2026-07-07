import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class BuilderService {
  constructor(private readonly prisma: PrismaService) {}

  async savePageContent(pageId: string, userId: string, content: any) {
    const page = await this.prisma.page.findUnique({ where: { id: pageId } });
    if (!page) throw new NotFoundException('Page not found');

    // Delete existing nodes for this page
    await this.prisma.pageNode.deleteMany({ where: { pageId } });

    // Save new node tree as single root node with full JSON
    const node = await this.prisma.pageNode.create({
      data: {
        projectId: page.projectId,
        pageId,
        nodeType: 'root',
        sortOrder: 0,
        props: content,
      },
    });

    // Create a version snapshot
    await this.prisma.changeSet.create({
      data: {
        projectId: page.projectId,
        createdById: userId,
        source: 'visual_builder',
        summary: `Saved page: ${page.title}`,
        status: 'applied',
      },
    }).catch(() => {});

    return { saved: true, nodeId: node.id, timestamp: new Date().toISOString() };
  }

  async loadPageContent(pageId: string) {
    const page = await this.prisma.page.findUnique({ where: { id: pageId } });
    if (!page) throw new NotFoundException('Page not found');

    const rootNode = await this.prisma.pageNode.findFirst({
      where: { pageId, nodeType: 'root' },
      orderBy: { sortOrder: 'desc' },
    });

    return {
      page: { id: page.id, title: page.title, slug: page.slug, status: page.status },
      content: rootNode?.props || null,
    };
  }

  async publishPage(pageId: string) {
    await this.prisma.page.update({ where: { id: pageId }, data: { status: 'published' } });
    return { published: true };
  }

  async unpublishPage(pageId: string) {
    await this.prisma.page.update({ where: { id: pageId }, data: { status: 'draft' } });
    return { published: false };
  }

  async getVersionHistory(pageId: string) {
    const page = await this.prisma.page.findUnique({ where: { id: pageId }, select: { projectId: true } });
    if (!page) return [];

    return this.prisma.changeSet.findMany({
      where: { projectId: page.projectId, source: 'visual_builder' },
      orderBy: { createdAt: 'desc' },
      take: 20,
      select: { id: true, summary: true, status: true, createdAt: true },
    });
  }

  async getPublishedPage(slug: string) {
    const page = await this.prisma.page.findFirst({
      where: { slug, status: 'published' },
    });
    if (!page) throw new NotFoundException('Page not found or not published');

    const rootNode = await this.prisma.pageNode.findFirst({
      where: { pageId: page.id, nodeType: 'root' },
    });

    return {
      page: { id: page.id, title: page.title, slug: page.slug, seoTitle: page.seoTitle, seoDesc: page.seoDesc },
      content: rootNode?.props || null,
    };
  }
}
