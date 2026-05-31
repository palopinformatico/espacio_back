import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) { }

  async create(createUserDto: CreateUserDto): Promise<User> {
    try {
      // Verificar si el usuario ya existe
      const existingUser = await this.userRepository.findOne({
        where: { username: createUserDto.username },
      });

      if (existingUser) {
        throw new ConflictException('El nombre de usuario ya existe');
      }

      const { password, ...userData } = createUserDto;

      // Encriptar contraseña
      const hashedPassword = await bcrypt.hash(password, 10);

      const newUser = this.userRepository.create({
        ...userData,
        password: hashedPassword,
      });

      const savedUser = await this.userRepository.save(newUser);

      // No devolver la contraseña en la respuesta
      delete savedUser.password;
      return savedUser;
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new BadRequestException(`Error al crear usuario: ${error.message}`);
    }
  }

  async findAll(): Promise<User[]> {
    const users = await this.userRepository.find();
    // Remover contraseñas de la respuesta
    return users.map(user => {
      delete user.password;
      return user;
    });
  }

  async findOne(id: number): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }

    delete user.password;
    return user;
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }

    // Si se está actualizando la contraseña, encriptarla
    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    // Si se está actualizando la imagen y existe una anterior, eliminarla
    if (updateUserDto.profileImage && user.profileImage) {
      this.deleteOldImage(user.profileImage);
    }

    // Actualizar el usuario
    Object.assign(user, updateUserDto);
    const updatedUser = await this.userRepository.save(user);

    delete updatedUser.password;
    return updatedUser;
  }

  async remove(id: number): Promise<{ message: string }> {
    const user = await this.userRepository.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }

    // Eliminar imagen de perfil si existe
    if (user.profileImage) {
      this.deleteOldImage(user.profileImage);
    }

    await this.userRepository.delete(id);
    return { message: `Usuario con ID ${id} eliminado correctamente` };
  }

  async findByUsername(username: string): Promise<User | undefined> {
    return this.userRepository.findOne({ where: { username } });
  }

  async validateUser(username: string, password: string): Promise<User | null> {
    const user = await this.findByUsername(username);
    if (user && (await bcrypt.compare(password, user.password))) {
      return user;
    }
    return null;
  }

  // Método privado para eliminar imagen antigua
  private deleteOldImage(imagePath: string): void {
    try {
      const fullPath = path.join(process.cwd(), imagePath);
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
      }
    } catch (error) {
      console.error('Error al eliminar imagen:', error);
      // No lanzar error, solo loggear
    }
  }
}


