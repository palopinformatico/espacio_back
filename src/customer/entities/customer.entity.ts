import { Gasto } from "src/gastos/entities/gasto.entity";
import { Order } from "src/orders/entities/order.entity";
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity('customer')
export class Customer {

    @PrimaryGeneratedColumn()
    id: number;
    
    @Column({ nullable: true })
    customerName: string;
  
    @Column({ nullable: true })
    customerPhone: string;

    @Column({ nullable: true })
    customerEmail: string;

    @Column({ nullable: true })
    customerAddress: string;

    @OneToMany(()=>Order,(order)=>order.customer)
    order:Order[];

    @OneToMany(() => Gasto, (gasto) => gasto.customer)
    gastos: Gasto[];


}
