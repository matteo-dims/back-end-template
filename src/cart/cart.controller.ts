import {
  Controller,
  Post,
  Body,
  Request,
  UseGuards,
  Delete,
  NotFoundException,
  Param,
} from '@nestjs/common';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from 'src/auth/enums/role.enum';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { CartService } from './cart.service';
import { ItemDTO } from './dtos/item.dto';
import { ApiTags, ApiResponse, ApiBearerAuth, ApiOperation, ApiParam, ApiBody } from '@nestjs/swagger';

@ApiTags('Cart')
@Controller('cart')
@ApiBearerAuth()

export class CartController {
  constructor(private cartService: CartService) { }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.User, Role.Admin)
  @Post('/')
  @ApiOperation({ summary: 'Add an item to the cart' })
  @ApiBody({ type: ItemDTO })
  @ApiResponse({ status: 200, description: 'Item added to the cart successfully' })
  async addItemToCart(@Request() req, @Body() itemDTO: ItemDTO) {
    const userId = req.user.userId;
    const cart = await this.cartService.addItemToCart(userId, itemDTO);
    return cart;
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.User)
  @Delete('/')
  @ApiOperation({ summary: 'Remove an item from the cart' })
  @ApiBody({ type: String })
  @ApiResponse({ status: 200, description: 'Item removed from the cart successfully' })
  async removeItemFromCart(@Request() req, @Body() { productId }) {
    const userId = req.user.userId;
    const cart = await this.cartService.removeItemFromCart(userId, productId);
    if (!cart) throw new NotFoundException('Item does not exist');
    return cart;
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.User)
  @Delete('/:id')
  @ApiOperation({ summary: 'Delete the entire cart by user ID' })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 200, description: 'Cart deleted successfully' })
  async deleteCart(@Param('id') userId: string) {
    const cart = await this.cartService.deleteCart(userId);
    if (!cart) throw new NotFoundException('Cart does not exist');
    return cart;
  }

  @UseGuards(JwtAuthGuard)
  @Post('/pay/:id')
  @ApiOperation({ summary: 'Pay for the cart' })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 200, description: 'Payment successful', type: String })
  async payCart(@Param('id') cartId: string, @Request() req) {
    const payment_url = await this.cartService.payCart(cartId, req);
    return {payment_url: payment_url};
  }
}