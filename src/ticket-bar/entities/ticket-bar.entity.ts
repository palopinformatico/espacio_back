import { User } from 'src/users/entities/user.entity';
import { Product } from 'src/products/entities/product.entity';
import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    ManyToOne,
    JoinColumn,
    CreateDateColumn,
} from 'typeorm';

@Entity('ticketBar')
export class TicketBar {
    @PrimaryGeneratedColumn()
    idticketBar: number;

    @Column({ length: 45 })
    tipoTicket: string;

    @Column({ type: 'int', default: 0 })
    totalTicket: number;

    @Column({ type: 'int', default: 0 })
    propinaBar: number;

    @Column({ type: 'tinyint' })
    estadoTicket: number;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'idUser' })
    user: User;

    @Column({ nullable: true })
    idUser: number;

    @ManyToOne(() => Product)
    @JoinColumn({ name: 'idProduct' })
    product: Product;

    @Column()
    idProduct: number;

    @CreateDateColumn()
    createdAt: Date;

    @Column({ type: 'int', default: 1 })
    cantidad: number;
}
