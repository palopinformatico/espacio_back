import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UploadedFile, Query } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { extname } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { diskStorage } from 'multer';



@Controller('categorias')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}
  @Get('name')
  findName(@Query('name') name?: string) {
    if (name) {
      return this.categoriesService.findByName(name);
    }
    return this.categoriesService.findAll();
  }

  @Post()
  createCategory(@Body() categoria: { nombre: string; icono: string }) {
    return this.categoriesService.create(categoria);
  }

  @Get()
  findAll() {
    return this.categoriesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.categoriesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCategoryDto: UpdateCategoryDto) {
    return this.categoriesService.update(+id, updateCategoryDto);
  }

  @Delete(':id')
  async eliminarCategoria(@Param('id') id: number) {
    return await this.categoriesService.eliminarCategoria(id);
  }


  
}
