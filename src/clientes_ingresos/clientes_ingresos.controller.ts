import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ClienteIngresoService } from './clientes_ingresos.service';
import { CreateClienteIngresoDto } from './dto/create-cliente_ingreso.dto';
import { UpdateClienteIngresoDto } from './dto/update-cliente_ingreso.dto';

@Controller('clientes-ingresos')
export class ClienteIngresoController {
    constructor(private readonly clienteIngresoService: ClienteIngresoService) { }

    @Post()
    create(@Body() createClienteIngresoDto: CreateClienteIngresoDto) {
        return this.clienteIngresoService.create(createClienteIngresoDto);
    }

    @Get()
    findAll() {
        return this.clienteIngresoService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.clienteIngresoService.findOne(+id);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updateClienteIngresoDto: UpdateClienteIngresoDto) {
        return this.clienteIngresoService.update(+id, updateClienteIngresoDto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.clienteIngresoService.remove(+id);
    }
}
