import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateDocumentoIngresoDto } from './dto/create-documento_ingreso.dto';
import { UpdateDocumentoIngresoDto } from './dto/update-documento_ingreso.dto';
import { DocumentoIngreso } from './entities/documento_ingreso.entity';

@Injectable()
export class DocumentoIngresoService {
    constructor(
        @InjectRepository(DocumentoIngreso)
        private readonly documentoRepository: Repository<DocumentoIngreso>,
    ) { }

    async create(createDocumentoIngresoDto: CreateDocumentoIngresoDto) {
        const documento = this.documentoRepository.create(createDocumentoIngresoDto);
        return await this.documentoRepository.save(documento);
    }

    async findAll() {
        return await this.documentoRepository.find();
    }

    async findOne(id: number) {
        const documento = await this.documentoRepository.findOneBy({ id });
        if (!documento) throw new NotFoundException(`Document with ID ${id} not found`);
        return documento;
    }

    async update(id: number, updateDocumentoIngresoDto: UpdateDocumentoIngresoDto) {
        const documento = await this.findOne(id);
        this.documentoRepository.merge(documento, updateDocumentoIngresoDto);
        return await this.documentoRepository.save(documento);
    }

    async remove(id: number) {
        const documento = await this.findOne(id);
        return await this.documentoRepository.remove(documento);
    }
}
