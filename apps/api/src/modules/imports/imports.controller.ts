import { Controller, Post, Get, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { ImportsService } from './imports.service';

@ApiTags('Imports')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('projects/:projectId/imports')
export class ImportsController {
  constructor(private imports: ImportsService) {}

  @Post()
  create(@Param('projectId') projectId: string, @Body() dto: { kind: string; sourceRef: string }) {
    return this.imports.createImport(projectId, dto);
  }

  @Get(':importId')
  getStatus(@Param('importId') importId: string) { return this.imports.getStatus(importId); }

  @Get()
  list(@Param('projectId') projectId: string) { return this.imports.list(projectId); }
}
