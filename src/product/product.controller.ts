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
  UseGuards,
} from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDTO } from './dtos/create-product.dto';
import { FilterProductDTO } from './dtos/filter-product.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiBody } from '@nestjs/swagger';
import { Product, ProductDocument } from './schemas/product.schema';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from 'src/auth/enums/role.enum';
import { RolesGuard } from 'src/auth/guards/roles.guard';


@ApiTags('Products')
@Controller('store/products')
export class ProductController {
  constructor(private productService: ProductService) {}

  @Get('/')
  @ApiOperation({ summary: 'Get products' })
  @ApiQuery({ name: 'filterProductDTO', type: FilterProductDTO, required: false })
  @ApiResponse({ status: 200, description: 'Return a list of products', isArray: true })
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
  @ApiOperation({ summary: 'Get a product by ID' })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 200, description: 'Return a product by ID', type: Product })
  async getProduct(@Param('id') id: string) {
    const product = await this.productService.getProduct(id);
    if (!product) throw new NotFoundException('Product does not exist!');
    return product;
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  @Post('/')
  @ApiOperation({ summary: 'Add a new product' })
  @ApiBody({ type: CreateProductDTO })
  @ApiResponse({ status: 201, description: 'Product added successfully', type: Product })
  @UseInterceptors(FileInterceptor('file'))
  async addProduct(@Body() createProductDTO: CreateProductDTO, @UploadedFile() file: Express.Multer.File) {
    return await this.productService.addProduct(createProductDTO, file);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  @Put('/:id')
  @ApiOperation({ summary: 'Update a product by ID' })
  @ApiParam({ name: 'id', type: String })
  @ApiBody({ type: CreateProductDTO })
  @ApiResponse({ status: 200, description: 'Product updated successfully', type: Product })
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

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  @Delete('/:id')
  @ApiOperation({ summary: 'Delete a product by ID' })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 200, description: 'Product deleted successfully', type: Product })
  async deleteProduct(@Param('id') id: string) {
    const product = await this.productService.deleteProduct(id);
    if (!product) throw new NotFoundException('Product does not exist');
    return product;
  }
}
