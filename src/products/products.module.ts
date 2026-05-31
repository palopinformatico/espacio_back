import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { Category } from 'src/categories/entities/category.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { Order } from 'src/orders/entities/order.entity';
import { MulterModule } from '@nestjs/platform-express/multer';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { CacheService } from '../common/cache.service';

@Module({
  imports: [TypeOrmModule.forFeature([Product]), TypeOrmModule.forFeature([Category]), TypeOrmModule.forFeature([Order]),
  MulterModule.register({
    storage: diskStorage({
      destination: './uploads',
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, `${uniqueSuffix}${extname(file.originalname)}`);
      },
    }),
  }),
  ],
  controllers: [ProductsController],
  providers: [ProductsService, CacheService],
})
export class ProductsModule { }
