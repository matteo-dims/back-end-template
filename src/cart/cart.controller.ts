import {Body, Controller, Delete, Get, NotFoundException, Param, Post, Request, UseGuards,} from '@nestjs/common';
import {Roles} from 'src/auth/decorators/roles.decorator';
import {Role} from 'src/auth/enums/role.enum';
import {JwtAuthGuard} from 'src/auth/guards/jwt.guard';
import {RolesGuard} from 'src/auth/guards/roles.guard';
import {CartService} from './cart.service';
import {ItemDTO} from './dtos/item.dto';
import {ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags} from '@nestjs/swagger';
import {CartBulkDTO} from './dtos/cartBulk.dto';
import {ProductService} from 'src/product/product.service';

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
                  imgUrl: product.imgUrl,
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
      return await this.cartService.getAllCarts();
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
      return await this.cartService.addItemToCart(userId, itemDTO);
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
  async removeItemFromCart(@Request() req, @Body() {productId, quantity}) {
    try {
      const userId = req.user.userId;
      const cart = await this.cartService.removeItemFromCart(userId, productId, quantity);
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
  async deleteCart(@Request() req) {
    try {
      const cart = await this.cartService.deleteCart(req.user.userId);
      if (!cart) throw new NotFoundException('Cart does not exist');
      return cart;
    } catch(error) {
      return error;
    }
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.User, Role.Admin)
  @Post('/pay')
  @ApiOperation({ summary: 'Pay for the cart' })
  @ApiResponse({ status: 200, description: 'Payment link provided', type: String })
  async payCart(@Request() req) {
    try {
      const client_secret = await this.cartService.payCart(req);
      return {clientSecret: client_secret};
    } catch(error) {
      return error;
    }
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.User, Role.Admin)
  @Post('/pay/status/:id')
  @ApiOperation({summary: 'Get && update status on a users cart.'})
  @ApiResponse({ status: 200, description: 'Cart updated', type: String })
  async paymentStatus(@Request() req, @Param('id') sessionId: string) {
    try {
      return await this.cartService.statusPayment(req, sessionId);
    } catch(error) {
      return error;
    }
  }
}
