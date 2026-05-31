import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { CategoriaGastoService } from './categoria-gasto.service';
import { CreateCategoriaGastoDto } from './dto/create-categoria-gasto.dto';
import { UpdateCategoriaGastoDto } from './dto/update-categoria-gasto.dto';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { RolesGuard } from 'src/roles/roles.guard';

@Controller('categoria-gasto')
export class CategoriaGastoController {
  constructor(private readonly categoriaGastoService: CategoriaGastoService) {}

  @Post()
  create(@Body() createCategoriaGastoDto: CreateCategoriaGastoDto) {
    return this.categoriaGastoService.create(createCategoriaGastoDto);
  }

  @Get()
  findAll() {
    return this.categoriaGastoService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.categoriaGastoService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCategoriaGastoDto: UpdateCategoriaGastoDto) {
    return this.categoriaGastoService.update(+id, updateCategoriaGastoDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.categoriaGastoService.remove(+id);
  }
}
