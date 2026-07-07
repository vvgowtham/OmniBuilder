import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { BuilderService } from './builder.service';

@Controller('builder')
export class BuilderController {
  constructor(private readonly builder: BuilderService) {}

  @UseGuards(AuthGuard('jwt'))
  @Post('pages/:pageId/save')
  save(@Param('pageId') pageId: string, @Request() req: any, @Body() body: { content: any }) {
    return this.builder.savePageContent(pageId, req.user.sub, body.content);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('pages/:pageId/load')
  load(@Param('pageId') pageId: string) {
    return this.builder.loadPageContent(pageId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('pages/:pageId/publish')
  publish(@Param('pageId') pageId: string) {
    return this.builder.publishPage(pageId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('pages/:pageId/unpublish')
  unpublish(@Param('pageId') pageId: string) {
    return this.builder.unpublishPage(pageId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('pages/:pageId/versions')
  versions(@Param('pageId') pageId: string) {
    return this.builder.getVersionHistory(pageId);
  }

  @Get('render/:slug')
  render(@Param('slug') slug: string) {
    return this.builder.getPublishedPage(slug);
  }
}
