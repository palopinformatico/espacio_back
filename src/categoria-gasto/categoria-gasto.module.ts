import { Module } from '@nestjs/common';

import { CategoriaGastoController } from './categoria-gasto.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Gasto } from 'src/gastos/entities/gasto.entity';
import { CategoriaGastoService } from './categoria-gasto.service';
import { CategoriaGasto } from './entities/categoria-gasto.entity';

@Module({
    imports:[TypeOrmModule.forFeature([Gasto,CategoriaGasto])],
  controllers: [CategoriaGastoController],
  providers: [CategoriaGastoService],
})
export class CategoriaGastoModule {}
