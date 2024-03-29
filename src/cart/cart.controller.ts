import {
  Controller,
  Post,
  Body,
  Request,
  UseGuards,
  Delete,
  NotFoundException,
  Param,
  Get,
} from '@nestjs/common';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from 'src/auth/enums/role.enum';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { CartService } from './cart.service';
import { ItemDTO } from './dtos/item.dto';
import { ApiTags, ApiResponse, ApiBearerAuth, ApiOperation, ApiParam, ApiBody } from '@nestjs/swagger';
import { CartBulkDTO } from './dtos/cartBulk.dto';
import { ProductService } from 'src/product/product.service';

@ApiTags('Cart')
@Controller('cart')
@ApiBearerAuth()

export class CartController {
  constructor(private cartService: CartService, private readonly productService: ProductService) { }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.User, Role.Admin)
  @Get('/')
  @ApiOperation({ summary: 'Get the cart of a user by userId.' })
  @ApiResponse({ status: 200, description: 'Cart got.' })
  async getUserCart(@Request() req) {
    try {
      const userId = req.user.userId;
      const cart = await this.cartService.getCart(userId);
      if (!cart) {
        return {error: 'This user has not any cart.'};
      }
      let transformedCart: CartBulkDTO = new CartBulkDTO();
        transformedCart.items = [];
        transformedCart._id = cart._id;
        transformedCart.cartState = cart.cartState;
        transformedCart.totalPrice = cart.totalPrice;
        transformedCart.userId = cart.userId;
        for (let item of cart.items) {
          const product = await this.productService.getProduct(item.productId);
            transformedCart.items.push(
              {
                product: {
                  _id: item.productId,
                  name: product.name,
                  description: product.description,
                  price: product.price,
                  category: product.category,
                  isSold: product.isSold,
                },
                quantity: item.quantity,
                subTotalPrice: item.subTotalPrice,
            }
            )
        }
      return transformedCart;
    } catch(error) {
      return error;
    }
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  @Get('/all')
  @ApiOperation({ summary: 'Get the cart of a user by userId.' })
  @ApiResponse({ status: 200, description: 'Cart got.' })
  async getAllCart(@Request() req) {
    try {
      const cart = await this.cartService.getAllCarts();
      return cart;
    } catch(error) {
      return error;
    }
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.User, Role.Admin)
  @Post('/')
  @ApiOperation({ summary: 'Add an item to the cart' })
  @ApiBody({ type: ItemDTO })
  @ApiResponse({ status: 200, description: 'Item added to the cart successfully' })
  async addItemToCart(@Request() req, @Body() itemDTO: ItemDTO) {
    try {
      const userId = req.user.userId;
      const cart = await this.cartService.addItemToCart(userId, itemDTO);
      return cart;
    } catch(error) {
      return error;
    }
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.User, Role.Admin)
  @Delete('/')
  @ApiOperation({ summary: 'Remove an item from the cart' })
  @ApiBody({ type: String })
  @ApiResponse({ status: 200, description: 'Item removed from the cart successfully' })
  async removeItemFromCart(@Request() req, @Body() { productId }) {
    try {
      const userId = req.user.userId;
      const cart = await this.cartService.removeItemFromCart(userId, productId);
      if (!cart) throw new NotFoundException('Item does not exist');
      return cart;
    } catch(error) {
      return error;
    }
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.User, Role.Admin)
  @Delete('/:id')
  @ApiOperation({ summary: 'Delete the entire cart by user ID' })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 200, description: 'Cart deleted successfully' })
  async deleteCart(@Param('id') userId: string) {
    try {
      const cart = await this.cartService.deleteCart(userId);
      if (!cart) throw new NotFoundException('Cart does not exist');
      return cart;
    } catch(error) {
      return error;
    }
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.User, Role.Admin)
  @Post('/pay/')
  @ApiOperation({ summary: 'Pay for the cart' })
  @ApiResponse({ status: 200, description: 'Payment link provided', type: String })
  async payCart(@Request() req) {
    try {
      const payment_url = await this.cartService.payCart(req);
      return {payment_url: payment_url};
    } catch(error) {
      return error;
    }
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.User, Role.Admin)
  @Post('/pay/success')
  @ApiOperation({ summary: 'Payment successfull, update the products in consequences.' })
  @ApiResponse({ status: 200, description: 'Cart updated', type: String })
  async paymentSuccessfull(@Request() req) {
    try {
      return await this.cartService.successPayment(req);
    } catch(error) {
      return error;
    }
  }
}