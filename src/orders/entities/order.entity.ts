import { Customer } from 'src/customer/entities/customer.entity';
import { Mesa } from 'src/mesas/entities/mesa.entity';
import { ProductsOrders } from 'src/products-orders/entities/products-order.entity';
import { Product } from 'src/products/entities/product.entity';
import { User } from 'src/users/entities/user.entity';
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, OneToOne, ManyToMany, JoinTable, DeleteDateColumn, OneToMany } from 'typeorm';


@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  tableNumber: number;

  @Column()
  orderType: string;

  @Column({ type: 'text', nullable: true })
  detalle_venta: string;

  @Column({ type: 'varchar', default: 'activo' })
  estado: string;

  @Column('int', { default: 0 })
  propina: number;

  @Column({type:'int',nullable:true})
  costo_delivery: number;

  @Column()
  status: string;

  @Column('int', { default: 0 })
  neto: number;

  @Column('int')
  total: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ nullable: true })
  paymentMethod?: string | null;

  @ManyToOne(() => User, user => user.id)
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => Customer, (customer) => customer.id, { nullable: true })
  @JoinColumn({ name: 'customerId' })
  customer: Customer;

  @OneToMany(() => ProductsOrders, po => po.order, { eager: true })
  orderProducts: ProductsOrders[];

  @ManyToOne(() => Mesa, mesa => mesa.orders, { nullable: true })
  mesa: Mesa;

  @ManyToOne(() => Product, product => product.id)
  @JoinColumn({ name: 'productId' })
  product: Product;

  @DeleteDateColumn({ nullable: true })
  deletedAt?: Date;

  @Column()
  numeroVenta: number;

  @Column({ type: 'int', nullable: true })
  mesaId: number | null;

}
