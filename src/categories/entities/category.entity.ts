import { Product } from 'src/products/entities/product.entity';
import { Entity, Column, PrimaryGeneratedColumn, ManyToMany } from 'typeorm';

@Entity('categories')
export class Category {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nombre: string;

  @Column()
  icono: string;

  // 👇 Relación inversa (opcional, pero buena práctica)
  @ManyToMany(() => Product, (product) => product.categories)
  products: Product[];
}
