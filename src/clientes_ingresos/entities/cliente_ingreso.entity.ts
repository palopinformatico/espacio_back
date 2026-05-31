import { Ingreso } from 'src/ingresos/entities/ingreso.entity';
import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';


@Entity('clientes_ingresos')
export class ClienteIngreso {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ length: 255 })
    nombre: string;

    @Column({ length: 255 })
    rut: string;

    @Column({ type: 'int', nullable: true })
    telefono: number;

    @Column({ length: 255, nullable: true })
    email: string;

    @ManyToMany(() => Ingreso, (ingreso) => ingreso.cliente)
    ingresos: Ingreso[];
}
