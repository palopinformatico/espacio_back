import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UploadedFile, Query, ParseIntPipe, Put, BadRequestException } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { extname } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { diskStorage } from 'multer';
import { PaginationDto } from './dto/PaginationDto.dto';
import { ProductDto } from './dto/productDTO.dto';
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) { }

  @Put(':id')
  @UseInterceptors(FileInterceptor('image', {
    storage: diskStorage({
      destination: './uploads',
      filename: (req, file, callback) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        callback(null, 'image-' + uniqueSuffix + extname(file.originalname));
      },
    }),
  }))
  async updateProduct(
    @Param('id') id: number,
    @Body() body: any,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const imagePath = file ? `/uploads/${file.filename}` : undefined;
    return this.productsService.updateImage(id, body, imagePath);
  }



  @Get('buscar')
  buscarProductos(
    @Query('nombre') nombre?: string,
    @Query('categorias') categorias?: string, // puede ser "1,2,3"
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
    @Query('includeImages') includeImages: string = 'true', // nuevo parámetro
    @Query('lightweight') lightweight: string = 'false', // nuevo parámetro
  ) {
    const categoryIds = categorias
      ? categorias.split(',').map((id) => parseInt(id, 10))
      : undefined;

    return this.productsService.buscarPorNombre(
      nombre,
      categoryIds,
      parseInt(page, 10),
      parseInt(limit, 10),
      includeImages === 'true',
      lightweight === 'true',
    );
  }

  @Get('buscars')
  buscarProducto(
    @Query('nombre') nombre?: string,
    @Query('categorias') categorias?: string
  ) {
    const categoryIds = categorias
      ? categorias.split(',').map((id) => parseInt(id, 10))
      : undefined;

    return this.productsService.buscarPorNombres(nombre, categoryIds);
  }




  @Post()
  @UseInterceptors(FileInterceptor('image', {
    storage: diskStorage({
      destination: './uploads', // Carpeta donde se guardarán las imágenes
      filename: (req, file, callback) => {
        const fileExt = extname(file.originalname);
        const filename = `${uuidv4()}${fileExt}`;
        callback(null, filename);
      },
    }),
  }))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body('name') name: string, // Obtener otros campos si es necesario
  ) {
    const fileUrl = `/uploads/${file.filename}`;

    // Guardar el producto junto con la ruta de la imagen en la base de datos
    const product = await this.productsService.createProductWithImage(name, fileUrl);

    return {
      message: 'Imagen subida y producto guardado exitosamente',
      product,
    };
  }


  @Get('finds')
  async findAlls(): Promise<ProductDto[]> {
    return this.productsService.findAlls();
  }


  @Get('find')
  async findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10
  ): Promise<PaginationDto<ProductDto>> {
    const validPage = Math.max(1, Number(page) || 1);
    const validLimit = Math.max(1, Number(limit) || 10);
    return this.productsService.findAll(validPage, validLimit);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(+id);
  }



  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productsService.remove(+id);
  }


  @Post('crear')
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, callback) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          callback(null, 'image-' + uniqueSuffix + extname(file.originalname));
        },
      }),
    }),
  )
  async create(
    @Body() body: any,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    // ✅ Parsear categoryIds si viene como string
    let categoryIds: number[] = [];


    if (body.categoryIds) {
      if (Array.isArray(body.categoryIds)) {
        // Vienen múltiples categoryIds (ej: ['1', '2', '3'])
        categoryIds = body.categoryIds.map((id: string) => parseInt(id, 10));
      } else if (typeof body.categoryIds === 'string') {
        // Puede venir como JSON, CSV o número suelto
        if (body.categoryIds.startsWith('[')) {
          categoryIds = JSON.parse(body.categoryIds).map((id: any) => parseInt(id, 10));
        } else if (body.categoryIds.includes(',')) {
          categoryIds = body.categoryIds.split(',').map((id: string) => parseInt(id, 10));
        } else {
          // 🟢 Caso de una sola categoría
          categoryIds = [parseInt(body.categoryIds, 10)];
        }
      }
    }

    // ✅ Manejar imagen
    const imageUrl = file ? `/uploads/${file.filename}` : undefined;

    // ✅ Convertir campos booleanos (FormData no envía checkboxes desmarcados)
    const ofreceLocal = body.ofreceLocal === 'true' || body.ofreceLocal === true;
    const ofreceDelivery = body.ofreceDelivery === 'true' || body.ofreceDelivery === true;

    // ✅ Crear producto usando el servicio
    const product = await this.productsService.create({
      ...body,
      categoryIds,
      imageUrl,
      ofreceLocal,
      ofreceDelivery,
    });

    // ✅ Devolver producto con URL relativa (el frontend construirá la URL completa)
    return product;
  }




}





