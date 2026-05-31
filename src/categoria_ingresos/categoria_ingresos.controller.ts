import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CategoriaIngresoService } from './categoria_ingresos.service';
import { CreateCategoriaIngresoDto } from './dto/create-categoria_ingreso.dto';
import { UpdateCategoriaIngresoDto } from './dto/update-categoria_ingreso.dto';

@Controller('categoria-ingresos')
export class CategoriaIngresoController {
    constructor(private readonly categoriaIngresoService: CategoriaIngresoService) { }

    @Post()
    create(@Body() createCategoriaIngresoDto: CreateCategoriaIngresoDto) {
        return this.categoriaIngresoService.create(createCategoriaIngresoDto);
    }

    @Get()
    findAll() {
        return this.categoriaIngresoService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.categoriaIngresoService.findOne(+id);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updateCategoriaIngresoDto: UpdateCategoriaIngresoDto) {
        return this.categoriaIngresoService.update(+id, updateCategoriaIngresoDto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.categoriaIngresoService.remove(+id);
    }
}
