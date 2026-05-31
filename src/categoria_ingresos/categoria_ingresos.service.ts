import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateCategoriaIngresoDto } from './dto/create-categoria_ingreso.dto';
import { UpdateCategoriaIngresoDto } from './dto/update-categoria_ingreso.dto';
import { CategoriaIngreso } from './entities/categoria_ingreso.entity';

@Injectable()
export class CategoriaIngresoService {
    constructor(
        @InjectRepository(CategoriaIngreso)
        private readonly categoriaRepository: Repository<CategoriaIngreso>,
    ) { }

    async create(createCategoriaIngresoDto: CreateCategoriaIngresoDto) {
        const categoria = this.categoriaRepository.create(createCategoriaIngresoDto);
        return await this.categoriaRepository.save(categoria);
    }

    async findAll() {
        return await this.categoriaRepository.find();
    }

    async findOne(id: number) {
        const categoria = await this.categoriaRepository.findOneBy({ id });
        if (!categoria) throw new NotFoundException(`Category with ID ${id} not found`);
        return categoria;
    }

    async update(id: number, updateCategoriaIngresoDto: UpdateCategoriaIngresoDto) {
        const categoria = await this.findOne(id);
        this.categoriaRepository.merge(categoria, updateCategoriaIngresoDto);
        return await this.categoriaRepository.save(categoria);
    }

    async remove(id: number) {
        const categoria = await this.findOne(id);
        return await this.categoriaRepository.remove(categoria);
    }
}
