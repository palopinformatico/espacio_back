import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CategoriaGasto } from './entities/categoria-gasto.entity';
import { CreateCategoriaGastoDto } from './dto/create-categoria-gasto.dto';
import { UpdateCategoriaGastoDto } from './dto/update-categoria-gasto.dto';

@Injectable()
export class CategoriaGastoService {
  constructor(
    @InjectRepository(CategoriaGasto)
    private readonly categoriaGastoRepository: Repository<CategoriaGasto>,
  ) {}

  create(createCategoriaGastoDto: CreateCategoriaGastoDto) {
    const categoria = this.categoriaGastoRepository.create(createCategoriaGastoDto);
    return this.categoriaGastoRepository.save(categoria);
  }

  findAll() {
    return this.categoriaGastoRepository.find();
  }

  findOne(id: number) {
    return this.categoriaGastoRepository.findOne({ where: { id } });
  }

  async update(id: number, updateCategoriaGastoDto: UpdateCategoriaGastoDto) {
    await this.categoriaGastoRepository.update(id, updateCategoriaGastoDto);
    return this.findOne(id);
  }

  remove(id: number) {
    return this.categoriaGastoRepository.delete(id);
  }
}
