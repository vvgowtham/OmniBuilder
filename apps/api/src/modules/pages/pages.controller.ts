import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PagesService } from './pages.service';

@UseGuards(AuthGuard('jwt'))
@Controller('pages')
export class PagesController {
  constructor(private readonly pages: PagesService) {}

  @Get()
  findAll(@Query('projectId') projectId?: string, @Query('status') status?: string, @Query('search') search?: string) {
    return this.pages.findAll(projectId, status, search);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.pages.findOne(id);
  }

  @Post()
  create(@Body() dto: { projectId: string; title: string; slug?: string; pageType?: string; seoTitle?: string; seoDesc?: string }) {
    return this.pages.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: { title?: string; slug?: string; status?: string; seoTitle?: string; seoDesc?: string }) {
    return this.pages.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.pages.remove(id);
  }

  @Post(':id/publish')
  publish(@Param('id') id: string) {
    return this.pages.publish(id);
  }

  @Post(':id/unpublish')
  unpublish(@Param('id') id: string) {
    return this.pages.unpublish(id);
  }
}
