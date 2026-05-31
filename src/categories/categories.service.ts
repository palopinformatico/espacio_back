import { Injectable } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Category } from './entities/category.entity';
import { Like, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  async create(categoria: Partial<Category>) {  // Usar Partial<Category> para evitar problemas de tipado
    const nuevaCategoria = this.categoryRepository.create({
      nombre: categoria.nombre,
      icono: categoria.icono
    });

    return await this.categoryRepository.save(nuevaCategoria);
  }

  async findAll() {
    return await this.categoryRepository.find();
  }

  async findOne(id: number) {
    return await this.categoryRepository.findOneBy({id});
  }

  async update(id: number, updateCategoryDto: UpdateCategoryDto) {
    return await this.categoryRepository.update(id,updateCategoryDto);
  }

  async remove(id: number) {
    return await this.categoryRepository.delete(id);
  }

  async eliminarCategoria(id: number): Promise<void> {
    const categoria = await this.categoryRepository.findOneBy({id});

    if (!categoria) {
      throw new Error('Categoría no encontrada');
    }

    // Elimina la categoría de la base de datos
    await this.categoryRepository.remove(categoria);
  }
  
  async findByName(name: string): Promise<Category[]> {
    const nameTrimmed = name.trim();
  
    return this.categoryRepository.find({
      where: { nombre: Like(`%${nameTrimmed}%`) },
      order: { id: 'DESC' },
    });
  }

}
