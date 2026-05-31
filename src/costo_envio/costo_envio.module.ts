import { Module } from '@nestjs/common';
import { CostoEnvioService } from './costo_envio.service';
import { CostoEnvioController } from './costo_envio.controller';
import { CostoEnvio } from './entities/costo_envio.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
    imports:[TypeOrmModule.forFeature([CostoEnvio])],
  controllers: [CostoEnvioController],
  providers: [CostoEnvioService],
})
export class CostoEnvioModule {}
