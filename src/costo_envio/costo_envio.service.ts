import { Injectable } from '@nestjs/common';
import { CreateCostoEnvioDto } from './dto/create-costo_envio.dto';
import { UpdateCostoEnvioDto } from './dto/update-costo_envio.dto';
import { CostoEnvio } from './entities/costo_envio.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class CostoEnvioService {
  constructor(
    @InjectRepository(CostoEnvio)
    private readonly costoEnvioRepository: Repository<CostoEnvio>,

  ) { }


  async create(createCostoEnvioDto: CreateCostoEnvioDto) {
    // Si se marca como por defecto, desmarcar el actual por defecto
    if (createCostoEnvioDto.porDefecto) {
      const actualPorDefecto = await this.costoEnvioRepository.findOne({
        where: { porDefecto: true }
      });
      if (actualPorDefecto) {
        await this.costoEnvioRepository.update(actualPorDefecto.id, { porDefecto: false });
      }
    }

    const costoEnvio = this.costoEnvioRepository.create(createCostoEnvioDto);
    return await this.costoEnvioRepository.save(costoEnvio);
  }

  async findAll() {
    return await this.costoEnvioRepository.find({
      order: {
        porDefecto: 'DESC', // El registro por defecto aparece primero
        id: 'ASC'
      },
    });
  }

  async findDefault() {
    return await this.costoEnvioRepository.findOne({
      where: { porDefecto: true }
    });
  }

  async findOne(id: number) {
    return await this.costoEnvioRepository.findOne({ where: { id } });
  }

  async update(id: number, updateCostoEnvioDto: UpdateCostoEnvioDto) {
    // Si se marca como por defecto, desmarcar el actual por defecto
    if (updateCostoEnvioDto.porDefecto) {
      const actualPorDefecto = await this.costoEnvioRepository.findOne({
        where: { porDefecto: true }
      });
      if (actualPorDefecto && actualPorDefecto.id !== id) {
        await this.costoEnvioRepository.update(actualPorDefecto.id, { porDefecto: false });
      }
    }

    await this.costoEnvioRepository.update(id, updateCostoEnvioDto);
    return await this.costoEnvioRepository.findOne({ where: { id } });
  }

  async remove(id: number) {
    await this.costoEnvioRepository.delete(id);
    return { message: `Costo de envío con ID ${id} eliminado correctamente` };
  }
}
