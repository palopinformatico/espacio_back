import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TicketBar } from './entities/ticket-bar.entity';
import { CreateTicketBarDto } from './dto/create-ticket-bar.dto';
import { UpdateTicketBarDto } from './dto/update-ticket-bar.dto';

@Injectable()
export class TicketBarService {
    constructor(
        @InjectRepository(TicketBar)
        private readonly ticketBarRepository: Repository<TicketBar>,
    ) { }

    async create(createTicketBarDto: CreateTicketBarDto): Promise<TicketBar> {
        const ticketBar = this.ticketBarRepository.create(createTicketBarDto);
        return await this.ticketBarRepository.save(ticketBar);
    }

    async findAll(): Promise<TicketBar[]> {
        return await this.ticketBarRepository.find({
            relations: ['user', 'product'],
        });
    }

    async findOne(id: number): Promise<TicketBar> {
        const ticketBar = await this.ticketBarRepository.findOne({
            where: { idticketBar: id },
            relations: ['user', 'product'],
        });

        if (!ticketBar) {
            throw new NotFoundException(`TicketBar con id ${id} no encontrado`);
        }

        return ticketBar;
    }

    async findByUser(idUser: number): Promise<TicketBar[]> {
        return await this.ticketBarRepository.find({
            where: { idUser },
            relations: ['user', 'product'],
        });
    }

    async findByEstado(estadoTicket: number): Promise<TicketBar[]> {
        return await this.ticketBarRepository.find({
            where: { estadoTicket },
            relations: ['user', 'product'],
        });
    }

    async update(id: number, updateTicketBarDto: UpdateTicketBarDto): Promise<TicketBar> {
        const ticketBar = await this.findOne(id);
        Object.assign(ticketBar, updateTicketBarDto);
        return await this.ticketBarRepository.save(ticketBar);
    }

    async remove(id: number): Promise<void> {
        const ticketBar = await this.findOne(id);
        await this.ticketBarRepository.remove(ticketBar);
    }
}
