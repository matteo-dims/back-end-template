import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Product, ProductDocument } from './schemas/product.schema';
import { CreateProductDTO } from './dtos/create-product.dto';
import { FilterProductDTO } from './dtos/filter-product.dto';
import { S3ManagerService } from 'src/s3-manager/s3-manager.service';

@Injectable()
export class ProductService {
  constructor(
    @InjectModel('Product')
    private readonly productModel: Model<ProductDocument>,
    private readonly s3manage: S3ManagerService
  ) {}

  async getFilteredProducts(
    filterProductDTO: FilterProductDTO,
  ): Promise<Product[]> {
    const { category, search } = filterProductDTO;
    let products = await this.getAllProducts();

    if (search) {
      products = products.filter(
        (product) =>
          product.name.includes(search) || product.description.includes(search),
      );
    }

    if (category) {
      products = products.filter((product) => product.category === category);
    }

    for (let product of products) {
      product.imgUrl = await this.s3manage.s3_getSignedUrl(product.imgUrl);
    }

    return products;
  }

  async getAllProducts(): Promise<Product[]> {
    const products = await this.productModel.find().exec();
    for (let product of products) {
      product.imgUrl = await this.s3manage.s3_getSignedUrl(product.imgUrl);
    }
    return products;
  }

  async getProduct(id: string): Promise<Product> {
    const product = await this.productModel.findById(id).exec();
    product.imgUrl = await this.s3manage.s3_getSignedUrl(product.imgUrl);
    return product;
  }

  async addProduct(createProductDTO: CreateProductDTO, file: Express.Multer.File): Promise<Product> {
    if (file) {
      const awsResponse = await this.s3manage.uploadFile(file);
      createProductDTO.imgUrl = file.originalname;
    }
    const newProduct = await this.productModel.create(createProductDTO);
    return newProduct.save();
  }

  async updateProduct(
    id: string,
    createProductDTO: CreateProductDTO,
    file: Express.Multer.File
  ): Promise<Product> {
    if (file) {
      const awsResponse = await this.s3manage.uploadFile(file);
      createProductDTO.imgUrl = file.originalname;
    }
    const updatedProduct = await this.productModel
      .findByIdAndUpdate(id, createProductDTO, { new: true });
    return updatedProduct;
  }

  async deleteProduct(id: string): Promise<any> {
    const product = await this.productModel.findById(id).exec();
    await this.s3manage.s3_delete(product.imgUrl);
    const deletedProduct = await this.productModel.findByIdAndRemove(id);
    return deletedProduct;
  }
}