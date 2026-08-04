import { Category } from 'src/categories/entities/category.entity';
import { Order } from 'src/orders/entities/order.entity';
import { ProductsOrders } from 'src/products-orders/entities/products-order.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToMany,
  OneToMany,
  JoinTable,
  DeleteDateColumn,
} from 'typeorm';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column('text')
  description: string;

  @Column('int')
  price: number;

  @Column({ nullable: true })
  cantidad: number;

  @Column({ nullable: true })
  imageUrl: string;

  @Column({ default: true })
  ofreceLocal: boolean;

  @Column({ default: true })
  ofreceDelivery: boolean;

  // 👇 Relación muchos a muchos con categorías
  @ManyToMany(() => Category, { eager: true })
  @JoinTable({
    name: 'products_categories', // nombre de la tabla intermedia
    joinColumn: { name: 'product_id' },
    inverseJoinColumn: { name: 'category_id' },
  })
  categories: Category[];

  @OneToMany(() => Order, (order) => order.user)
  order: Order[];

  @OneToMany(() => ProductsOrders, (orderProduct) => orderProduct.product, { cascade: true })
  orderProducts: ProductsOrders[];

  @DeleteDateColumn({ nullable: true })
  deletedAt?: Date;
}
