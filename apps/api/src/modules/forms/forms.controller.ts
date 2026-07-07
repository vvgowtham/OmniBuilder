import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FormsService } from './forms.service';

@Controller('forms')
export class FormsController {
  constructor(private readonly forms: FormsService) {}

  @UseGuards(AuthGuard('jwt'))
  @Get()
  findAll(@Query('projectId') projectId?: string) { return this.forms.findAll(projectId); }

  @UseGuards(AuthGuard('jwt'))
  @Get(':id')
  findOne(@Param('id') id: string) { return this.forms.findOne(id); }

  @UseGuards(AuthGuard('jwt'))
  @Post()
  create(@Body() dto: { projectId: string; name: string; schema: any; settings?: any }) { return this.forms.create(dto); }

  @UseGuards(AuthGuard('jwt'))
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: { name?: string; schema?: any; settings?: any }) { return this.forms.update(id, dto); }

  @UseGuards(AuthGuard('jwt'))
  @Delete(':id')
  remove(@Param('id') id: string) { return this.forms.remove(id); }

  @Post(':id/submit')
  submitForm(@Param('id') formId: string, @Body() data: any) { return this.forms.submitForm(formId, data); }

  @UseGuards(AuthGuard('jwt'))
  @Get(':id/submissions')
  getSubmissions(@Param('id') formId: string) { return this.forms.getSubmissions(formId); }
}
