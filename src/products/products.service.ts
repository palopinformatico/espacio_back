import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './entities/product.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Category } from 'src/categories/entities/category.entity';
import { In, Like, Repository, DataSource } from 'typeorm';
import { PaginationDto } from './dto/PaginationDto.dto';
import { ProductDto } from './dto/productDTO.dto';
import { CacheService } from '../common/cache.service';
import { LightweightProductDto } from './dto/lightweight-product.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    @InjectRepository(Product)
    private readonly proRepository: Repository<Product>,
    private readonly cacheService: CacheService,
    private readonly dataSource: DataSource,
  ) { }


  async createProductWithImage(name: string, imageUrl: string): Promise<Product> {
    const newProduct = this.proRepository.create({
      name,
      imageUrl,
    });
    return await this.proRepository.save(newProduct);
  }



  async create(createProductDto: CreateProductDto) {
    const { categoryIds, ...rest } = createProductDto;

    const categories = await this.categoryRepository.findBy({
      id: In(categoryIds),
    });

    if (!categories.length) {
      throw new NotFoundException('No se encontraron las categorías seleccionadas');
    }

    const product = this.proRepository.create({
      ...rest,
      categories,
    });

    const saved = await this.proRepository.save(product);
    // Invalidar caché de productos
    this.cacheService.invalidatePattern('products:search:.*');
    return saved;
  }



  async updateImage(id: number, body: any, imagePath?: string) {

    if (body.categories && typeof body.categories === 'string') {
      try {
        body.categories = JSON.parse(body.categories);
      } catch {
        body.categories = [];
      }
    }
    const product = await this.proRepository.findOne({
      where: { id },
      relations: ['categories'],
    });

    if (!product) {
      throw new NotFoundException('Producto no encontrado');
    }

    const updatedData: any = { ...body };

    console.log('🔍 Debug - updateImage - Datos recibidos:', {
      body,
      productId: id,
      currentProduct: {
        ofreceLocal: product.ofreceLocal,
        ofreceDelivery: product.ofreceDelivery
      }
    });

    // 🔹 Convertir valores
    if (updatedData.price) updatedData.price = Number(updatedData.price);
    updatedData.cantidad = updatedData.cantidad ?? product.cantidad ?? 0;

    // 🔹 Convertir campos booleanos
    if (updatedData.ofreceLocal !== undefined) {
      updatedData.ofreceLocal = updatedData.ofreceLocal === 'true' || updatedData.ofreceLocal === true;
    } else {
      // Si no se envía el campo, mantener el valor actual del producto
      updatedData.ofreceLocal = product.ofreceLocal;
    }
    if (updatedData.ofreceDelivery !== undefined) {
      updatedData.ofreceDelivery = updatedData.ofreceDelivery === 'true' || updatedData.ofreceDelivery === true;
    } else {
      // Si no se envía el campo, mantener el valor actual del producto
      updatedData.ofreceDelivery = product.ofreceDelivery;
    }

    console.log('🔍 Debug - updateImage - Valores finales a guardar:', {
      ofreceLocal: updatedData.ofreceLocal,
      ofreceDelivery: updatedData.ofreceDelivery
    });

    // 🔹 Sincronizar categorías (eliminar las anteriores y asignar nuevas)
    if (Array.isArray(updatedData.categories)) {
      // Buscar las nuevas categorías
      const nuevasCategorias = await this.categoryRepository.find({
        where: { id: In(updatedData.categories) },
      });

      // Limpiar categorías anteriores y asignar nuevas
      product.categories = []; // limpia la relación previa
      await this.proRepository.save(product); // guarda vacío para limpiar relación

      // Asignar nuevas
      product.categories = nuevasCategorias;
    }

    // 🔹 Eliminar dominio si viene en body
    if (updatedData.imageUrl && updatedData.imageUrl.startsWith('http')) {
      updatedData.imageUrl = updatedData.imageUrl.replace('https://espacioboulevard.com', '');
    }

    // 🔹 Asignar campos actualizados
    Object.assign(product, {
      ...updatedData,
      categories: product.categories,
    });

    // 🔹 Imagen
    if (imagePath && !imagePath.includes('undefined')) {
      product.imageUrl = imagePath;
    }

    const saved = await this.proRepository.save(product);
    // Invalidar caché de productos
    this.cacheService.invalidatePattern('products:search:.*');
    return this.normalizeProduct(saved);
  }

  /**
   * Sanitiza y valida una URL de imagen.
   * Retorna null si la URL es inválida o no es una imagen válida.
   */
  private sanitizeImageUrl(imageUrl: string | null | undefined): string | null {
    if (!imageUrl || imageUrl.trim() === '') {
      return null;
    }

    const baseUrl = 'https://espacioboulevard.com';

    // Si ya es una URL completa válida con nuestro dominio
    if (imageUrl.startsWith(baseUrl)) {
      return imageUrl;
    }

    // Si es una ruta relativa válida de uploads
    if (imageUrl.startsWith('/uploads/')) {
      return `${baseUrl}${imageUrl}`;
    }

    // Si empieza con uploads/ sin slash
    if (imageUrl.startsWith('uploads/')) {
      return `${baseUrl}/${imageUrl}`;
    }

    // Si es una URL externa válida (http/https)
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      return imageUrl;
    }

    // URL inválida (como "150?text=No+Image") - retornar null
    console.warn(`⚠️ URL de imagen inválida ignorada: ${imageUrl}`);
    return null;
  }

  private normalizeProduct(product: Product) {
    return {
      ...product,
      imageUrl: this.sanitizeImageUrl(product.imageUrl),
      ofreceLocal: product.ofreceLocal,
      ofreceDelivery: product.ofreceDelivery,
    };
  }





  async findAll(
    page: number = 1,
    limit: number = 10,
  ): Promise<PaginationDto<ProductDto>> {
    // Validar que page y limit sean números enteros positivos
    page = Math.max(1, Number(page) || 1);
    limit = Math.max(1, Number(limit) || 10);

    const skip = (page - 1) * limit;

    const [products, total] = await this.proRepository.findAndCount({
      take: limit,
      skip: skip,
      relations: ['categories'], // 👈 ahora ManyToMany
      order: { id: 'DESC' },
    });

    return {
      total,
      currentPage: page,
      totalPages: Math.max(1, Math.ceil(total / limit)),
      limit,
      data: products.map(
        ({ id, name, description, price, imageUrl, categories, ofreceLocal, ofreceDelivery }) => {
          return {
            id,
            name,
            description,
            price,
            imageUrl: this.sanitizeImageUrl(imageUrl),
            ofreceLocal,
            ofreceDelivery,
            // 👇 devolver array de categorías en lugar de solo la primera
            categories: categories.map((cat) => ({
              id: cat.id,
              nombre: cat.nombre,
              icono: cat.icono,
            })),
          };
        },
      ),
    };
  }

  async findAlls(): Promise<ProductDto[]> {
    const products = await this.proRepository.find({
      relations: ['categories'], // ManyToMany
      order: { id: 'DESC' },
    });

    return products.map(({ id, name, description, price, imageUrl, categories, ofreceLocal, ofreceDelivery }) => ({
      id,
      name,
      description,
      price,
      imageUrl: this.sanitizeImageUrl(imageUrl),
      ofreceLocal,
      ofreceDelivery,
      categories: categories.map((cat) => ({
        id: cat.id,
        nombre: cat.nombre,
        icono: cat.icono,
      })),
    }));
  }


  async buscarPorNombre(
    nombre?: string,
    categoryIds?: number[],
    page = 1,
    limit = 10,
    includeImages = true,
    lightweight = false,
  ): Promise<{ data: ProductDto[] | LightweightProductDto[]; total: number; currentPage: number }> {
    // Generar clave de caché
    const cacheKey = `products:search:${nombre || 'all'}:${categoryIds?.join(',') || 'all'}:${page}:${limit}:${includeImages}:${lightweight}`;

    // Intentar obtener del caché
    const cached = this.cacheService.get<{ data: ProductDto[] | LightweightProductDto[]; total: number; currentPage: number }>(cacheKey);
    if (cached) {
      return cached;
    }

    const baseUrl = 'https://espacioboulevard.com';
    page = Math.max(1, page);
    limit = Math.max(1, limit);
    const skip = (page - 1) * limit;

    const query = this.proRepository.createQueryBuilder('product');

    // Solo cargar categorías si no es lightweight o si filtramos por categoría
    if (!lightweight || (categoryIds && categoryIds.length > 0)) {
      query.leftJoinAndSelect('product.categories', 'category');
    } else {
      query.leftJoin('product.categories', 'category');
    }

    if (nombre) {
      query.andWhere('product.name LIKE :nombre', { nombre: `%${nombre}%` });
    }

    if (categoryIds && categoryIds.length > 0) {
      query.andWhere('category.id IN (:...categoryIds)', { categoryIds });
    }

    // Contar total (más eficiente sin joins innecesarios)
    const total = await query.getCount();

    // Optimización: solo seleccionar campos necesarios para lightweight
    if (lightweight) {
      query.select(['product.id', 'product.name', 'product.price']);
      if (categoryIds && categoryIds.length > 0) {
        query.addSelect(['category.id']);
      }
    }

    // Obtener productos con paginación
    const productos = await query
      .skip(skip)
      .take(limit)
      .orderBy('product.id', 'DESC')
      .getMany();

    let data: ProductDto[] | LightweightProductDto[];

    if (lightweight) {
      // Respuesta ligera sin imágenes ni descripciones
      data = productos.map((producto) => ({
        id: producto.id,
        name: producto.name,
        price: producto.price,
        categoryIds: producto.categories?.map(cat => cat.id) || [],
      })) as LightweightProductDto[];
    } else {
      // Respuesta completa
      data = productos.map((producto) => ({
        id: producto.id,
        name: producto.name,
        description: producto.description,
        price: producto.price,
        imageUrl: includeImages ? this.sanitizeImageUrl(producto.imageUrl) : null,
        ofreceLocal: producto.ofreceLocal,
        ofreceDelivery: producto.ofreceDelivery,
        categories: producto.categories?.map((cat) => ({
          id: cat.id,
          nombre: cat.nombre,
          icono: cat.icono,
        })) || [],
      })) as ProductDto[];
    }

    const result = {
      data,
      total,
      currentPage: page,
    };

    // Guardar en caché (5 minutos para lightweight, 2 minutos para completo)
    const ttl = lightweight ? 5 * 60 * 1000 : 2 * 60 * 1000;
    this.cacheService.set(cacheKey, result, ttl);

    return result;
  }


  async buscarPorNombres(
    nombre?: string,
    categoryIds?: number[]
  ): Promise<ProductDto[]> {
    const baseUrl = 'https://espacioboulevard.com';

    const query = this.proRepository.createQueryBuilder('product')
      .leftJoinAndSelect('product.categories', 'category');

    if (nombre) {
      query.andWhere('product.name LIKE :nombre', { nombre: `%${nombre}%` });
    }

    if (categoryIds && categoryIds.length > 0) {
      query.andWhere('category.id IN (:...categoryIds)', { categoryIds });
    }

    const productos = await query
      .orderBy('product.price', 'ASC') // 👈 menor a mayor
      .addOrderBy('product.id', 'DESC') // opcional, para mantener consistencia
      .getMany();

    return productos.map((producto) => ({
      id: producto.id,
      name: producto.name,
      description: producto.description,
      price: producto.price,
      imageUrl: this.sanitizeImageUrl(producto.imageUrl),
      ofreceLocal: producto.ofreceLocal,
      ofreceDelivery: producto.ofreceDelivery,
      categories: producto.categories.map((cat) => ({
        id: cat.id,
        nombre: cat.nombre,
        icono: cat.icono,
      })),
    }));
  }





  async findOne(id: number) {
    return await this.proRepository.findOneBy({ id });
  }

  async remove(id: number) {
    // Eliminar tickets relacionados primero
    await this.dataSource
      .getRepository('TicketBar')
      .delete({ idProduct: id });

    // Luego eliminar el producto
    const result = await this.proRepository.delete(id);

    // Invalidar caché de productos
    this.cacheService.invalidatePattern('products:search:.*');

    return result;
  }


}
