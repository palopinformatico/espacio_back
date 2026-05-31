import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { DocumentoIngreso } from './entities/documento_ingreso.entity';
import { DocumentoIngresoController } from './documentos_ingreso.controller';
import { DocumentoIngresoService } from './documentos_ingreso.service';

@Module({
    imports: [TypeOrmModule.forFeature([DocumentoIngreso])],
    controllers: [DocumentoIngresoController],
    providers: [DocumentoIngresoService],
    exports: [DocumentoIngresoService],
})
export class DocumentoIngresoModule { }
