import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClienteIngresoService } from './clientes_ingresos.service';
import { ClienteIngresoController } from './clientes_ingresos.controller';
import { ClienteIngreso } from './entities/cliente_ingreso.entity';

@Module({
    imports: [TypeOrmModule.forFeature([ClienteIngreso])],
    controllers: [ClienteIngresoController],
    providers: [ClienteIngresoService],
    exports: [ClienteIngresoService],
})
export class ClienteIngresoModule { }
