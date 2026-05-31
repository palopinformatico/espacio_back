import { Gasto } from 'src/gastos/entities/gasto.entity';
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';


@Entity('categorias_gasto')
export class CategoriaGasto {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100 })
  nombre: string;

  @OneToMany(() => Gasto, (gasto) => gasto.categorias_gasto)
  gastos: Gasto[];
}

