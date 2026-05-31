import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { DocumentoIngresoService } from './documentos_ingreso.service';
import { CreateDocumentoIngresoDto } from './dto/create-documento_ingreso.dto';
import { UpdateDocumentoIngresoDto } from './dto/update-documento_ingreso.dto';

@Controller('documentos-ingreso')
export class DocumentoIngresoController {
    constructor(private readonly documentoIngresoService: DocumentoIngresoService) { }

    @Post()
    create(@Body() createDocumentoIngresoDto: CreateDocumentoIngresoDto) {
        return this.documentoIngresoService.create(createDocumentoIngresoDto);
    }

    @Get()
    findAll() {
        return this.documentoIngresoService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.documentoIngresoService.findOne(+id);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updateDocumentoIngresoDto: UpdateDocumentoIngresoDto) {
        return this.documentoIngresoService.update(+id, updateDocumentoIngresoDto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.documentoIngresoService.remove(+id);
    }
}
