import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { MenusService } from './menus.service';

@UseGuards(AuthGuard('jwt'))
@Controller('menus')
export class MenusController {
  constructor(private readonly menus: MenusService) {}

  @Get()
  findAll(@Query('projectId') projectId?: string) { return this.menus.findAll(projectId); }

  @Get(':id')
  findOne(@Param('id') id: string) { return this.menus.findOne(id); }

  @Post()
  create(@Body() dto: { projectId: string; name: string; locationKey: string }) { return this.menus.create(dto); }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: { name?: string; locationKey?: string }) { return this.menus.update(id, dto); }

  @Delete(':id')
  remove(@Param('id') id: string) { return this.menus.remove(id); }

  @Post(':id/items')
  addItem(@Param('id') menuId: string, @Body() dto: { label: string; targetType: string; targetRef: string; parentItemId?: string; sortOrder?: number }) {
    return this.menus.addItem(menuId, dto);
  }

  @Patch('items/:itemId')
  updateItem(@Param('itemId') itemId: string, @Body() dto: { label?: string; targetRef?: string; sortOrder?: number }) {
    return this.menus.updateItem(itemId, dto);
  }

  @Delete('items/:itemId')
  removeItem(@Param('itemId') itemId: string) { return this.menus.removeItem(itemId); }
}
