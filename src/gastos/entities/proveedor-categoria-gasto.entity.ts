import { Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Proveedor } from '../../proveedores/entities/proveedor.entity'; // Ajusta la ruta a tu entidad Proveedor
import { CategoriaGasto } from 'src/categoria-gasto/entities/categoria-gasto.entity';
 // Ajusta la ruta a tu entidad Categoria

@Entity('proveedores_categorias_gastos')
export class ProveedorCategoriaGasto {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Proveedor, { nullable: false })
  @JoinColumn({ name: 'proveedorId' })
  proveedor: Proveedor;

  @ManyToOne(() => CategoriaGasto, { nullable: false })
  @JoinColumn({ name: 'categoriaId' })
  categoria: CategoriaGasto;
}