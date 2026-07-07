import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class MenusService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(projectId?: string) {
    const where: any = {};
    if (projectId) where.projectId = projectId;
    return this.prisma.menu.findMany({ where, include: { items: { orderBy: { sortOrder: 'asc' } } } });
  }

  async findOne(id: string) {
    const menu = await this.prisma.menu.findUnique({ where: { id }, include: { items: { orderBy: { sortOrder: 'asc' }, include: { children: { orderBy: { sortOrder: 'asc' } } } } } });
    if (!menu) throw new NotFoundException('Menu not found');
    return menu;
  }

  async create(data: { projectId: string; name: string; locationKey: string }) {
    return this.prisma.menu.create({ data });
  }

  async update(id: string, data: { name?: string; locationKey?: string }) {
    return this.prisma.menu.update({ where: { id }, data });
  }

  async remove(id: string) {
    await this.prisma.menuItem.deleteMany({ where: { menuId: id } }).catch(() => {});
    return this.prisma.menu.delete({ where: { id } });
  }

  async addItem(menuId: string, data: { label: string; targetType: string; targetRef: string; parentItemId?: string; sortOrder?: number }) {
    return this.prisma.menuItem.create({ data: { menuId, ...data, sortOrder: data.sortOrder || 0 } });
  }

  async updateItem(itemId: string, data: { label?: string; targetRef?: string; sortOrder?: number }) {
    return this.prisma.menuItem.update({ where: { id: itemId }, data });
  }

  async removeItem(itemId: string) {
    return this.prisma.menuItem.delete({ where: { id: itemId } });
  }
}
