import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getStats(organizationId?: string) {
    const [totalPages, totalUsers, totalProjects, totalMedia, totalForms, totalMenus] = await Promise.all([
      this.prisma.page.count().catch(() => 0),
      this.prisma.user.count().catch(() => 0),
      this.prisma.project.count().catch(() => 0),
      this.prisma.mediaAsset.count().catch(() => 0),
      this.prisma.form.count().catch(() => 0),
      this.prisma.menu.count().catch(() => 0),
    ]);

    return {
      totalPages,
      totalUsers,
      totalProjects,
      totalMedia,
      totalForms,
      totalMenus,
      totalComponents: 120,
      totalTemplates: 8,
    };
  }

  async getRecentActivity() {
    const recentPages = await this.prisma.page.findMany({ take: 5, orderBy: { updatedAt: 'desc' }, select: { title: true, updatedAt: true, status: true } }).catch(() => []);
    const recentUsers = await this.prisma.user.findMany({ take: 3, orderBy: { createdAt: 'desc' }, select: { fullName: true, createdAt: true } }).catch(() => []);

    const activities: Array<{ text: string; time: string }> = [];
    for (const p of recentPages) {
      activities.push({ text: `Page "${p.title}" ${p.status === 'published' ? 'published' : 'updated'}`, time: p.updatedAt.toISOString() });
    }
    for (const u of recentUsers) {
      activities.push({ text: `User "${u.fullName}" joined`, time: u.createdAt.toISOString() });
    }

    return activities.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 8);
  }
}
