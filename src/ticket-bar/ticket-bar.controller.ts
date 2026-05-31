import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    ParseIntPipe,
    Query,
} from '@nestjs/common';
import { TicketBarService } from './ticket-bar.service';
import { CreateTicketBarDto } from './dto/create-ticket-bar.dto';
import { UpdateTicketBarDto } from './dto/update-ticket-bar.dto';

@Controller('ticket-bar')
export class TicketBarController {
    constructor(private readonly ticketBarService: TicketBarService) { }

    @Get()
    findAll() {
        return this.ticketBarService.findAll();
    }

    @Get('user/:idUser')
    findByUser(@Param('idUser', ParseIntPipe) idUser: number) {
        return this.ticketBarService.findByUser(idUser);
    }

    @Get('estado/:estado')
    findByEstado(@Param('estado', ParseIntPipe) estado: number) {
        return this.ticketBarService.findByEstado(estado);
    }

    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.ticketBarService.findOne(id);
    }

    @Patch(':id')
    update(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateTicketBarDto: UpdateTicketBarDto,
    ) {
        return this.ticketBarService.update(id, updateTicketBarDto);
    }

    @Delete(':id')
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.ticketBarService.remove(id);
    }
     @Post()
    create(@Body() createTicketBarDto: CreateTicketBarDto) {
        return this.ticketBarService.create(createTicketBarDto);
    }
}
