import { CategoriaGasto } from 'src/categoria-gasto/entities/categoria-gasto.entity';
import { Customer } from 'src/customer/entities/customer.entity';
import { Proveedor } from '../../proveedores/entities/proveedor.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  ManyToMany,
  JoinTable,
  DeleteDateColumn
} from 'typeorm';
import { User } from '../../users/entities/user.entity';


@Entity('expenses')
export class Gasto {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('int')
  amount: number;


  @Column({ type: 'varchar', length: 255, nullable: true })
  description?: string;

  @Column({ type: 'varchar', length: 150, nullable: true })
  concepto?: string;

  @Column({ type: 'enum', enum: ['ingreso', 'egreso'] })
  type: 'ingreso' | 'egreso';

  @Column({ type: 'enum', enum: ['efectivo', 'tarjeta', 'transferencia', 'cheque'], default: 'efectivo' })
  paymentMethod: 'efectivo' | 'tarjeta' | 'transferencia' | 'cheque';

  @ManyToOne(() => Customer, (customer) => customer.gastos, { nullable: true })
  @JoinColumn({ name: 'customerId' })
  customer?: Customer;

  @ManyToOne(() => CategoriaGasto, (categoria) => categoria.gastos, { nullable: true })
  @JoinColumn({ name: 'categoriaId' })
  categorias_gasto?: CategoriaGasto;

  @ManyToOne(() => Proveedor, (proveedor) => proveedor.gastos, { nullable: true })
  @JoinColumn({ name: 'proveedorId' })
  proveedor?: Proveedor;

  @ManyToMany(() => User)
  @JoinTable({
    name: 'expenses_users',
    joinColumn: {
      name: 'id_expenses',
      referencedColumnName: 'id'
    },
    inverseJoinColumn: {
      name: 'id_user',
      referencedColumnName: 'id'
    }
  })
  users?: User[];


  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @Column({ type: 'enum', enum: ['ninguno', 'diario', 'semanal', 'mensual'], default: 'ninguno' })
  frequency: 'ninguno' | 'diario' | 'semanal' | 'mensual';

  @Column({ type: 'date', nullable: true })
  startDate: Date;

  @Column({ type: 'date', nullable: true })
  endDate?: Date;

  @Column({ type: 'int', nullable: true })
  dayOfWeek?: number;

  @Column({ nullable: true })
  dayOfMonth?: number; // 1..31, solo para mensua

  @Column({ type: 'enum', enum: ['activo', 'cancelado', 'anulado'], default: 'activo' })
  estado: 'activo' | 'cancelado' | 'anulado';

  @DeleteDateColumn({ nullable: true })
  deletedAt: Date;
}
