import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { MediaService } from './media.service';

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
