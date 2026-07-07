import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class ImportsService {
  private logger = new Logger(ImportsService.name);

  constructor(private prisma: PrismaService, @InjectQueue('imports') private importQueue: Queue) {}

  async createImport(projectId: string, dto: { kind: string; sourceRef: string }) {
    const source = await this.prisma.projectSource.create({ data: { projectId, kind: dto.kind, sourceRef: dto.sourceRef } });
    const importRecord = await this.prisma.import.create({ data: { projectId, sourceId: source.id, status: 'queued' } });
    await this.prisma.project.update({ where: { id: projectId }, data: { sourceType: dto.kind, status: 'importing' } });
    await this.importQueue.add('process-import', { importId: importRecord.id, projectId, kind: dto.kind, sourceRef: dto.sourceRef });
    this.logger.log(`Import queued: ${importRecord.id}`);
    return importRecord;
  }

  async getStatus(importId: string) { return this.prisma.import.findUnique({ where: { id: importId } }); }
  async list(projectId: string) { return this.prisma.import.findMany({ where: { projectId }, orderBy: { startedAt: 'desc' } }); }
}
