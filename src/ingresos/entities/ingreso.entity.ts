import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { CategoriaIngreso } from '../../categoria_ingresos/entities/categoria_ingreso.entity';
import { ClienteIngreso } from '../../clientes_ingresos/entities/cliente_ingreso.entity';
import { User } from '../../users/entities/user.entity';

@Entity('ingresos')
export class Ingreso {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ length: 255 })
    concepto: string;

    @Column({ type: 'date' })
    fecha: Date;


    @Column({ type: 'int' })
    monto: number;

    @Column({ name: 'metodo_pago', length: 255 })
    metodo_pago: string;

    @ManyToOne(() => CategoriaIngreso)
    @JoinColumn({ name: 'id_categorias_ingresos' })
    categoria: CategoriaIngreso;

    @ManyToOne(() => ClienteIngreso)
    @JoinColumn({ name: 'id_clientes_ingresos' })
    cliente: ClienteIngreso;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'user_id' })
    user: User;
}
