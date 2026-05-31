import { Order } from 'src/orders/entities/order.entity';
import { Column, Entity, OneToMany, OneToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity('mesa')
export class Mesa {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  numero_mesa: string;

  @Column()
  status: string;

  @OneToMany(() => Order, (order) => order.mesa)
orders: Order[];

}
  
