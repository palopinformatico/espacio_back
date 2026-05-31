import {
  Controller, Get, Post, Patch, Param, Body,
  UploadedFile, UseInterceptors, NotFoundException
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { ThemeService } from './theme.service';
import { CreateThemeDto } from './dto/create-theme.dto';
import { UpdateThemeDto } from './dto/update-theme.dto';

import { existsSync, mkdirSync } from 'fs';
import { Theme } from './entities/theme.entity';

@Controller('themes')
export class ThemeController {
  constructor(private readonly service: ThemeService) { }

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get('default')
  findDefault() {
    return this.service.findDefault();
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.service.findOne(Number(id));
  }

  @Post()
  create(@Body() body: CreateThemeDto) {
    return this.service.create(body);
  }

  @Patch(':id')
  update(@Param('id') id: number, @Body() body: UpdateThemeDto) {
    return this.service.update(Number(id), body);
  }

  @Patch(':id/activate')
  activate(@Param('id') id: number) {
    return this.service.activate(Number(id));
  }

  @Post(':id/upload-background')
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: (req, file, cb) => {
        const uploadPath = join(__dirname, '..', '..', 'uploads', 'themes');
        if (!existsSync(uploadPath)) mkdirSync(uploadPath, { recursive: true });
        cb(null, uploadPath);
      },
      filename: (req, file, cb) => {
        const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, unique + extname(file.originalname));
      }
    }),
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
  }))
  async uploadBackground(@Param('id') id: number, @UploadedFile() file: Express.Multer.File) {
    if (!file) throw new NotFoundException('File missing');
    const filePath = `/uploads/themes/${file.filename}`;
    return this.service.update(Number(id), {
      backgroundImage: filePath,
      backgroundColor: undefined // keep as-is unless provided
    });
  }
}
