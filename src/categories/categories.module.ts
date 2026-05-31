import { Module } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CategoriesController } from './categories.controller';
import { Category } from './entities/category.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@nestjs/platform-express/multer';

@Module({
  imports:[TypeOrmModule.forFeature([Category]),
  MulterModule.register({
    dest: './uploads/categorias', // Carpeta donde se guardarán las imágenes
  }),
],
  controllers: [CategoriesController],
  providers: [CategoriesService],
})
export class CategoriesModule {}
