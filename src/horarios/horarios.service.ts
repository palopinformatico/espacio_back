import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Horario } from './entities/horario.entity';
import { CreateHorarioDto } from './dto/create-horario.dto';
import { UpdateHorarioDto } from './dto/update-horario.dto';

@Injectable()
export class HorariosService {
  constructor(
    @InjectRepository(Horario)
    private readonly horarioRepo: Repository<Horario>,
  ) {}

  async create(dto: CreateHorarioDto) {
    const horario = this.horarioRepo.create(dto);
    return await this.horarioRepo.save(horario);
  }

  async findAll() {
    return await this.horarioRepo.find();
  }

  async findOne(id: number) {
    const horario = await this.horarioRepo.findOne({ where: { id } });
    if (!horario) throw new NotFoundException('Horario no encontrado');
    return horario;
  }

  async update(id: number, dto: UpdateHorarioDto) {
    console.log('🔍 HORARIOS DEBUG: Llamada a update()');
    console.log('🔍 HORARIOS DEBUG: ID:', id);
    console.log('🔍 HORARIOS DEBUG: DTO recibido:', dto);
    
    const result = await this.horarioRepo.update(id, dto);
    console.log('🔍 HORARIOS DEBUG: Resultado update:', result);
    
    if (result.affected === 0) throw new NotFoundException('Horario no encontrado');
    
    const updatedHorario = await this.findOne(id);
    console.log('🔍 HORARIOS DEBUG: Horario actualizado:', updatedHorario);
    
    return updatedHorario;
  }

  async remove(id: number) {
    const horario = await this.findOne(id);
    return await this.horarioRepo.remove(horario);
  }

  // ⭐ Endpoint especial para frontend
  async getConfig() {
    const horarios = await this.horarioRepo.find();
    return horarios.reduce((acc, h) => {
      acc[h.seccion] = {
        enabled: h.enabled,
        hora_inicio: h.hora_inicio,
        hora_fin: h.hora_fin,
        trabaja_domingo: h.trabaja_domingo, // Retorna 'S' o 'N' directamente
      };
      return acc;
    }, {});
  }
}
