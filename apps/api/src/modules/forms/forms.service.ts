import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class FormsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(projectId?: string) {
    const where: any = {};
    if (projectId) where.projectId = projectId;
    return this.prisma.form.findMany({ where, include: { _count: { select: { submissions: true } } } });
  }

  async findOne(id: string) {
    const form = await this.prisma.form.findUnique({ where: { id }, include: { submissions: { orderBy: { createdAt: 'desc' }, take: 50 } } });
    if (!form) throw new NotFoundException('Form not found');
    return form;
  }

  async create(data: { projectId: string; name: string; schema: any; settings?: any }) {
    return this.prisma.form.create({ data });
  }

  async update(id: string, data: { name?: string; schema?: any; settings?: any }) {
    return this.prisma.form.update({ where: { id }, data });
  }

  async remove(id: string) {
    await this.prisma.formSubmission.deleteMany({ where: { formId: id } }).catch(() => {});
    return this.prisma.form.delete({ where: { id } });
  }

  async submitForm(formId: string, data: any) {
    return this.prisma.formSubmission.create({ data: { formId, data } });
  }

  async getSubmissions(formId: string) {
    return this.prisma.formSubmission.findMany({ where: { formId }, orderBy: { createdAt: 'desc' } });
  }
}
