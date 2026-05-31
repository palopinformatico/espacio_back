import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CostoEnvioService } from './costo_envio.service';
import { CreateCostoEnvioDto } from './dto/create-costo_envio.dto';
import { UpdateCostoEnvioDto } from './dto/update-costo_envio.dto';

@Controller('costo-envio')
export class CostoEnvioController {
  constructor(private readonly costoEnvioService: CostoEnvioService) {}


  @Get()
  findAll() {
    return this.costoEnvioService.findAll();
  }

  @Get('default')
  findDefault() {
    return this.costoEnvioService.findDefault();
  }

  @Post()
  create(@Body() createCostoEnvioDto: CreateCostoEnvioDto) {
    return this.costoEnvioService.create(createCostoEnvioDto);
  }


  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.costoEnvioService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCostoEnvioDto: UpdateCostoEnvioDto) {
    return this.costoEnvioService.update(+id, updateCostoEnvioDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.costoEnvioService.remove(+id);
  }
}
