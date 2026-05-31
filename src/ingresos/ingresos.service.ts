import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateIngresoDto } from './dto/create-ingreso.dto';
import { UpdateIngresoDto } from './dto/update-ingreso.dto';
import { Ingreso } from './entities/ingreso.entity';
import { CategoriaIngreso } from 'src/categoria_ingresos/entities/categoria_ingreso.entity';
import { ClienteIngreso } from 'src/clientes_ingresos/entities/cliente_ingreso.entity';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class IngresoService {
    constructor(
        @InjectRepository(Ingreso)
        private readonly ingresoRepository: Repository<Ingreso>,
        @InjectRepository(CategoriaIngreso)
        private readonly categoriaRepository: Repository<CategoriaIngreso>,
        @InjectRepository(ClienteIngreso)
        private readonly clienteRepository: Repository<ClienteIngreso>,
        private readonly usersService: UsersService,
    ) { }

    async create(createIngresoDto: CreateIngresoDto, user: any) {
        const { categoriaId, clienteId, categoriasIds, clientesIds, documentoId, userId, ...data } = createIngresoDto;

        // 1. Instanciar el ingreso base
        const ingreso = this.ingresoRepository.create(data);

        // 2. Manejar compatibilidad: usar propiedades nuevas o antiguas
        let finalCategoriaId = categoriaId;
        if (!finalCategoriaId && categoriasIds) {
            if (Array.isArray(categoriasIds)) {
                finalCategoriaId = categoriasIds.length > 0 ? categoriasIds[0] : null;
            } else {
                finalCategoriaId = categoriasIds;
            }
        }

        let finalClienteId = clienteId;
        if (!finalClienteId && clientesIds) {
            if (Array.isArray(clientesIds)) {
                finalClienteId = clientesIds.length > 0 ? clientesIds[0] : null;
            } else {
                finalClienteId = clientesIds;
            }
        }

        // 3. Cargar relaciones (Promise.all para hacerlo en paralelo y ganar velocidad)
        const [categoria, cliente] = await Promise.all([
            finalCategoriaId ? this.categoriaRepository.findOneBy({ id: finalCategoriaId }) : null,
            finalClienteId ? this.clienteRepository.findOneBy({ id: finalClienteId }) : null
        ]);

        ingreso.categoria = categoria;
        ingreso.cliente = cliente;

        // 4. Asignar usuario que crea el ingreso
        const usuarioParaGuardar = {
            id: Number(userId || user.userId || user.id),
            username: user.username,
            role: user.role
        } as any;
        ingreso.user = usuarioParaGuardar;

        return await this.ingresoRepository.save(ingreso);
    }

    async findAll(user: any) {
        console.log('=== DEBUG findAll ingresos ===');
        console.log('Usuario recibido:', user);
        console.log('user.id:', user.id);
        console.log('user.userId:', user.userId);
        console.log('typeof user.id:', typeof user.id);

        // Validar usuario
        if (!user || !user.id) {
            console.warn('Usuario sin ID válido intentando acceder a ingresos');
            return [];
        }

        const userId = Number(user.id);
        console.log('userId convertido:', userId);
        console.log('user.role:', user.role);

        if (isNaN(userId)) {
            console.error('ERROR CRÍTICO: El ID no es un número:', user.id);
            return [];
        }

        const relaciones = ['categoria', 'cliente', 'user'];
        console.log('Relaciones a cargar:', relaciones);

        // CASO ADMIN
        if (user.role === 'admin') {
            console.log('CASO ADMIN - Retornando todos los ingresos');
            const result = await this.ingresoRepository.find({
                relations: relaciones,
            });
            console.log('Resultados admin:', result.length, 'ingresos');
            return result;
        }

        // CASO GARZÓN
        if (user.role === 'garzon') {
            console.log('CASO GARZÓN - Filtrando por userId:', userId);
            console.log('WHERE clause:', { user: { id: userId } });
            const result = await this.ingresoRepository.find({
                where: {
                    user: { id: userId }
                },
                relations: relaciones,
            });
            console.log('Resultados garzón:', result.length, 'ingresos');
            return result;
        }

        console.log('Rol no reconocido:', user.role);
        return [];
    }

    async findOne(id: number) {
        const ingreso = await this.ingresoRepository.findOne({
            where: { id },
            relations: ['categoria', 'cliente', 'user'],
        });
        if (!ingreso) throw new NotFoundException(`Ingreso with ID ${id} not found`);
        return ingreso;
    }

    async update(id: number, updateIngresoDto: UpdateIngresoDto) {
        const ingreso = await this.findOne(id);
        const { categoriaId, clienteId, categoriasIds, clientesIds, documentoId, ...data } = updateIngresoDto;

        this.ingresoRepository.merge(ingreso, data);

        // Manejar compatibilidad: usar propiedades nuevas o antiguas
        let finalCategoriaId = categoriaId;
        if (!finalCategoriaId && categoriasIds) {
            if (Array.isArray(categoriasIds)) {
                finalCategoriaId = categoriasIds.length > 0 ? categoriasIds[0] : null;
            } else {
                finalCategoriaId = categoriasIds;
            }
        }

        let finalClienteId = clienteId;
        if (!finalClienteId && clientesIds) {
            if (Array.isArray(clientesIds)) {
                finalClienteId = clientesIds.length > 0 ? clientesIds[0] : null;
            } else {
                finalClienteId = clientesIds;
            }
        }

        if (finalCategoriaId) {
            ingreso.categoria = await this.categoriaRepository.findOneBy({ id: finalCategoriaId });
        }

        if (finalClienteId) {
            ingreso.cliente = await this.clienteRepository.findOneBy({ id: finalClienteId });
        }

        return await this.ingresoRepository.save(ingreso);
    }

    async remove(id: number) {
        const ingreso = await this.findOne(id);
        return await this.ingresoRepository.remove(ingreso);
    }
}
