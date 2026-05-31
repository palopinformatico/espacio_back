import { Column, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Ingreso } from 'src/ingresos/entities/ingreso.entity';

@Entity('documentos_ingreso')
export class DocumentoIngreso {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ name: 'tipo_documento', length: 255 })
    tipo_documento: string;

    @Column({ name: 'num_documento', type: 'int' })
    num_documento: number;

    @Column({ name: 'ingreso_id', type: 'int', nullable: true })
    ingresoId: number;

}
