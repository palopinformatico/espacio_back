import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Ingreso } from 'src/ingresos/entities/ingreso.entity';

@Entity('categoria_ingresos')
export class CategoriaIngreso {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ name: 'nombre_cat', length: 255 })
    nombre_cat: string;

    @ManyToMany(() => Ingreso, (ingreso) => ingreso.categoria)
    ingresos: Ingreso[];
}
