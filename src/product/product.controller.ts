import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Post,
  UploadedFile,
  UseInterceptors,
  Put,
  Query,
} from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDTO } from './dtos/create-product.dto';
import { FilterProductDTO } from './dtos/filter-product.dto';
import { FileInterceptor } from '@nestjs/platform-express';


@Controller('store/products')
export class ProductController {
  constructor(private productService: ProductService) {}

  @Get('/')
  async getProducts(@Query() filterProductDTO: FilterProductDTO) {
    if (Object.keys(filterProductDTO).length) {
      const filteredProducts =
        await this.productService.getFilteredProducts(filterProductDTO);
      return filteredProducts;
    } else {
      const allProducts = await this.productService.getAllProducts();
      return allProducts;
    }
  }

  @Get('/:id')
  async getProduct(@Param('id') id: string) {
    const product = await this.productService.getProduct(id);
    if (!product) throw new NotFoundException('Product does not exist!');
    return product;
  }

  @Post('/')
  @UseInterceptors(FileInterceptor('file'))
  async addProduct(@Body() createProductDTO: CreateProductDTO, @UploadedFile() file: Express.Multer.File) {
    return await this.productService.addProduct(createProductDTO, file);
  }

  @Put('/:id')
  @UseInterceptors(FileInterceptor('file'))
  async updateProduct(
    @Param('id') id: string,
    @Body() createProductDTO: CreateProductDTO,
    @UploadedFile() file: Express.Multer.File
  ) {
    const product = await this.productService.updateProduct(
      id,
      createProductDTO,
      file
    );
    if (!product) throw new NotFoundException('Product does not exist!');
    return product;
  }

  @Delete('/:id')
  async deleteProduct(@Param('id') id: string) {
    const product = await this.productService.deleteProduct(id);
    if (!product) throw new NotFoundException('Product does not exist');
    return product;
  }
}
