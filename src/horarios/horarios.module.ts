import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Horario } from './entities/horario.entity';
import { HorariosService } from './horarios.service';
import { HorariosController } from './horarios.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Horario]) // ✅ IMPORTANTE
  ],
  controllers: [HorariosController],
  providers: [HorariosService],
  exports: [HorariosService] // ✅ Si otros módulos lo usan
})
export class HorariosModule {}