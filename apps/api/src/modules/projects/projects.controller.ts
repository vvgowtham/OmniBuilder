import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { ProjectsService } from './projects.service';

@ApiTags('Projects')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('projects')
export class ProjectsController {
  constructor(private projects: ProjectsService) {}

  @Post()
  create(@Request() req: any, @Body() dto: { name: string; description?: string; organizationId: string }) {
    return this.projects.create(req.user.sub, dto);
  }

  @Get()
  findAll(@Query('organizationId') orgId: string) { return this.projects.findAll(orgId); }

  @Get(':id')
  findOne(@Param('id') id: string) { return this.projects.findOne(id); }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: any) { return this.projects.update(id, dto); }

  @Delete(':id')
  remove(@Param('id') id: string) { return this.projects.delete(id); }
}
