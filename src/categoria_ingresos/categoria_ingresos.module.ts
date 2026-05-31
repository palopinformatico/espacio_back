import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoriaIngresoService } from './categoria_ingresos.service';
import { CategoriaIngresoController } from './categoria_ingresos.controller';
import { CategoriaIngreso } from './entities/categoria_ingreso.entity';

@Module({
    imports: [TypeOrmModule.forFeature([CategoriaIngreso])],
    controllers: [CategoriaIngresoController],
    providers: [CategoriaIngresoService],
    exports: [CategoriaIngresoService],
})
export class CategoriaIngresoModule { }
