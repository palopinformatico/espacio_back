import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateProveedorDto } from './dto/create-proveedor.dto';
import { UpdateProveedorDto } from './dto/update-proveedor.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Proveedor } from './entities/proveedor.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ProveedoresService {
    constructor(
        @InjectRepository(Proveedor)
        private readonly proveedorRepository: Repository<Proveedor>,
    ) { }

    async create(createProveedorDto: CreateProveedorDto) {
        const proveedor = this.proveedorRepository.create(createProveedorDto);
        return await this.proveedorRepository.save(proveedor);
    }

    async findAll() {
        return await this.proveedorRepository.find();
    }

    async findOne(id: number) {
        const proveedor = await this.proveedorRepository.findOne({ where: { id } });
        if (!proveedor) {
            throw new NotFoundException(`Proveedor with ID ${id} not found`);
        }
        return proveedor;
    }

    async update(id: number, updateProveedorDto: UpdateProveedorDto) {
        const proveedor = await this.findOne(id);
        const updatedProveedor = Object.assign(proveedor, updateProveedorDto);
        return await this.proveedorRepository.save(updatedProveedor);
    }

    async remove(id: number) {
        const proveedor = await this.findOne(id);
        return await this.proveedorRepository.remove(proveedor);
    }
}
