import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { IngresoService } from './ingresos.service';
import { CreateIngresoDto } from './dto/create-ingreso.dto';
import { UpdateIngresoDto } from './dto/update-ingreso.dto';

@Controller('ingresos')
export class IngresoController {
    constructor(private readonly ingresoService: IngresoService) { }

    @Post()
    @UseGuards(AuthGuard('jwt'))
    create(@Body() createIngresoDto: CreateIngresoDto, @Req() req) {
        return this.ingresoService.create(createIngresoDto, req.user);
    }

    @Get()
    @UseGuards(AuthGuard('jwt'))
    findAll(@Req() req) {
        return this.ingresoService.findAll(req.user);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.ingresoService.findOne(+id);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updateIngresoDto: UpdateIngresoDto) {
        return this.ingresoService.update(+id, updateIngresoDto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.ingresoService.remove(+id);
    }
}
