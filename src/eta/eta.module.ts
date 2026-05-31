import { Module } from '@nestjs/common';
import { EtaService } from './eta.service';
import { EtaController } from './eta.controller';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Eta } from './entities/eta.entity';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([Eta]),
  ],
  controllers: [EtaController],
  providers: [EtaService],
  exports: [EtaService],
})
export class EtaModule {}
