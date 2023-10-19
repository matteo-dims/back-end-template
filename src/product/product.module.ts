import { Module } from '@nestjs/common';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';
import { MongooseModule } from '@nestjs/mongoose'; // 1. Import mongoose module
import { ProductSchema } from './schemas/product.schema'; // 2. Import product schema
import { S3ManagerModule } from 'src/s3-manager/s3-manager.module';

@Module({
  imports: [
    S3ManagerModule,
    MongooseModule.forFeature([{ name: 'Product', schema: ProductSchema }]),
  ],
  controllers: [ProductController],
  providers: [ProductService],
  exports: [ProductService],
})
export class ProductModule {}
