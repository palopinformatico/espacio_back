import { PartialType } from '@nestjs/mapped-types';
import { CreateTicketBarDto } from './create-ticket-bar.dto';

export class UpdateTicketBarDto extends PartialType(CreateTicketBarDto) { }
