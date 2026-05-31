import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TicketBarService } from './ticket-bar.service';
import { TicketBarController } from './ticket-bar.controller';
import { TicketBar } from './entities/ticket-bar.entity';
import { User } from 'src/users/entities/user.entity';
import { Product } from 'src/products/entities/product.entity';

@Module({
    imports: [TypeOrmModule.forFeature([TicketBar,User,Product])],
    controllers: [TicketBarController],
    providers: [TicketBarService],
    exports: [TicketBarService],
})
export class TicketBarModule { }
