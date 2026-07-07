import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards, UseInterceptors, UploadedFile } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { MediaService } from './media.service';
import * as path from 'path';
import * as fs from 'fs';

@UseGuards(AuthGuard('jwt'))
@Controller('media')
export class MediaController {
  constructor(private readonly media: MediaService) {}

  @Get()
  findAll(@Query('projectId') projectId?: string, @Query('mimeType') mimeType?: string) {
    return this.media.findAll(projectId, mimeType);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.media.findOne(id);
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async upload(@UploadedFile() file: any, @Body() body: { projectId?: string }) {
    if (!file) {
      return this.media.create({
        projectId: body.projectId || 'default',
        fileName: body.projectId || 'untitled',
        storageKey: `uploads/${Date.now()}`,
        mimeType: 'application/octet-stream',
        sizeBytes: 0,
      });
    }

    const uploadDir = path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

    const uniqueName = `${Date.now()}-${file.originalname}`;
    const filePath = path.join(uploadDir, uniqueName);
    fs.writeFileSync(filePath, file.buffer);

    return this.media.create({
      projectId: body.projectId || 'default',
      fileName: file.originalname,
      storageKey: `uploads/${uniqueName}`,
      mimeType: file.mimetype,
      sizeBytes: file.size,
    });
  }

  @Post()
  create(@Body() dto: { projectId: string; fileName: string; storageKey: string; mimeType: string; sizeBytes: number; width?: number; height?: number; altText?: string }) {
    return this.media.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: { altText?: string; fileName?: string }) {
    return this.media.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.media.remove(id);
  }
}
