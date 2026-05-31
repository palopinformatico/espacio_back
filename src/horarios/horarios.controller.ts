import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { HorariosService } from './horarios.service';
import { CreateHorarioDto } from './dto/create-horario.dto';
import { UpdateHorarioDto } from './dto/update-horario.dto';

@Controller('horarios')
export class HorariosController {
  constructor(private readonly horariosService: HorariosService) {}

  @Post()
  create(@Body() createHorarioDto: CreateHorarioDto) {
    return this.horariosService.create(createHorarioDto);
  }

  @Get()
  findAll() {
    return this.horariosService.findAll();
  }

  @Get('config')
  getConfig() {
    return this.horariosService.getConfig();
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.horariosService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: number, @Body() updateHorarioDto: UpdateHorarioDto) {
    console.log('🔍 CONTROLLER DEBUG: PATCH request received');
    console.log('🔍 CONTROLLER DEBUG: ID from URL:', id);
    console.log('🔍 CONTROLLER DEBUG: Body received:', updateHorarioDto);
    console.log('🔍 CONTROLLER DEBUG: Request URL:', `/horarios/${id}`);
    
    const result = this.horariosService.update(id, updateHorarioDto);
    console.log('🔍 CONTROLLER DEBUG: Calling service update...');
    
    return result;
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.horariosService.remove(id);
  }
}
