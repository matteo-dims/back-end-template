import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Product, ProductDocument } from './schemas/product.schema';
import { CreateProductDTO } from './dtos/create-product.dto';
import { FilterProductDTO } from './dtos/filter-product.dto';
import { S3ManagerService } from 'src/s3-manager/s3-manager.service';
import { ErrorTemplate } from 'src/utils/error.dto';

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
    try {
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
        if (product.imgUrl) {
          product.imgUrl = await this.s3manage.s3_getSignedUrl(product.imgUrl);
        }
      }
      return products;
    } catch (error) {
      if (error instanceof ErrorTemplate)
        throw error;
      else
        throw new ErrorTemplate(500, error.message || `Internal server error`, 'Product');
    }

  }

  async getAllProducts(): Promise<Product[]> {
    try {
      const products = await this.productModel.find().exec();
      for (let product of products) {
        if (product.imgUrl) {
          product.imgUrl = await this.s3manage.s3_getSignedUrl(product.imgUrl);
        }
      }
      return products;
    } catch (error) {
      if (error instanceof ErrorTemplate)
        throw error;
      else
        throw new ErrorTemplate(400, error.message || `Can't get products.`, 'Product');
    }
  }

  async getProduct(id: string): Promise<Product> {
    try {
      const product = await this.productModel.findById(id).exec();
      if (product.imgUrl) {
        product.imgUrl = await this.s3manage.s3_getSignedUrl(product.imgUrl);
      }
      return product;
    } catch (error) {
      if (error instanceof ErrorTemplate)
        throw error;
      else
        throw new ErrorTemplate(400, error.message || `Can\'t get product with id : ${id}.`, 'Product');
    }
  }

  async addProduct(createProductDTO: CreateProductDTO, file: Express.Multer.File): Promise<Product> {
    try {
      if (file) {
        const awsResponse = await this.s3manage.uploadFile(file);
        createProductDTO.imgUrl = file.originalname;
      }
      createProductDTO.isSold = false;
      const newProduct = await this.productModel.create(createProductDTO);
      return newProduct.save();
    } catch (error) {
      if (error instanceof ErrorTemplate)
        throw error;
      else
        throw new ErrorTemplate(400, error.message || `Can\'t add product with name : ${createProductDTO.name}.`, 'Product');
    }
  }

  async updateProduct(
    id: string,
    createProductDTO: Partial<CreateProductDTO>,
    file?: Express.Multer.File
  ): Promise<Product> {
    try {
      if (file) {
        const awsResponse = await this.s3manage.uploadFile(file);
        createProductDTO.imgUrl = file.originalname;
      }
      const updatedProduct = await this.productModel
        .findByIdAndUpdate(id, createProductDTO, { new: true });
      return updatedProduct;
    } catch (error) {
      if (error instanceof ErrorTemplate)
        throw error;
      else
        throw new ErrorTemplate(400, error.message || `Can\'t update product with id : ${id}.`, 'Product');
    }
  }

  async deleteProduct(id: string): Promise<any> {
    try {
      const product = await this.productModel.findById(id).exec();
      if (product.imgUrl) {
        await this.s3manage.s3_delete(product.imgUrl);
      }
      const deletedProduct = await this.productModel.findByIdAndRemove(id);
      return deletedProduct;
    } catch (error) {
      if (error instanceof ErrorTemplate)
        throw error;
      else
        throw new ErrorTemplate(400, error.message || `Can\'t delete product with id : ${id}.`, 'Product');
    }
  }
}