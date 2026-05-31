import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateClienteIngresoDto } from './dto/create-cliente_ingreso.dto';
import { UpdateClienteIngresoDto } from './dto/update-cliente_ingreso.dto';
import { ClienteIngreso } from './entities/cliente_ingreso.entity';

@Injectable()
export class ClienteIngresoService {
    constructor(
        @InjectRepository(ClienteIngreso)
        private readonly clienteRepository: Repository<ClienteIngreso>,
    ) { }

    async create(createClienteIngresoDto: CreateClienteIngresoDto) {
        const cliente = this.clienteRepository.create(createClienteIngresoDto);
        return await this.clienteRepository.save(cliente);
    }

    async findAll() {
        return await this.clienteRepository.find();
    }

    async findOne(id: number) {
        const cliente = await this.clienteRepository.findOneBy({ id });
        if (!cliente) throw new NotFoundException(`Client with ID ${id} not found`);
        return cliente;
    }

    async update(id: number, updateClienteIngresoDto: UpdateClienteIngresoDto) {
        const cliente = await this.findOne(id);
        this.clienteRepository.merge(cliente, updateClienteIngresoDto);
        return await this.clienteRepository.save(cliente);
    }

    async remove(id: number) {
        const cliente = await this.findOne(id);
        return await this.clienteRepository.remove(cliente);
    }
}
