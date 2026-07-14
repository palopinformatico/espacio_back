import { Gasto } from 'src/gastos/entities/gasto.entity';
import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('proveedores')
export class Proveedor {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    nombre: string;

    @Column({ nullable: true })
    rut: string;

    @Column({ nullable: true })
    razon_social: string;

    @Column({ nullable: true })
    direccion: string;

    @Column({ nullable: true })
    telefono: string;

    @Column({ nullable: true })
    email: string;

    @OneToMany(() => Gasto, (gasto) => gasto.proveedor)
    gastos: Gasto[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
