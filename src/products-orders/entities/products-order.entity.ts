import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, PrimaryColumn, DeleteDateColumn } from 'typeorm';
import { Order } from 'src/orders/entities/order.entity';
import { Product } from 'src/products/entities/product.entity';

@Entity('order_products')
export class ProductsOrders {
  @PrimaryColumn()
  orderId: number;

  @PrimaryColumn()
  productId: number;

  @ManyToOne(() => Order, order => order.orderProducts, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'orderId' })
  order: Order;

  @ManyToOne(() => Product, product => product.orderProducts, { onDelete: 'CASCADE', eager: true })
  @JoinColumn({ name: 'productId' })
  product: Product;

  @Column('int')
  cantidad: number;

  @Column('int')
  precioUnitario: number;

  @Column('int')
  subtotal: number;

  @DeleteDateColumn({ nullable: true })
  deletedAt?: Date;
}