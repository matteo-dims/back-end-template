import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Cart, CartDocument } from './schemas/cart.schema';
import { ItemDTO } from './dtos/item.dto';
import { StripeService } from 'src/stripe/stripe.service';
import { UserService } from 'src/user/user.service';
import { ProductService } from 'src/product/product.service';

@Injectable()
export class CartService {
  constructor(
    @InjectModel('Cart') private readonly cartModel: Model<CartDocument>,
    private readonly stripeService: StripeService,
    private readonly userService: UserService,
    private readonly productService: ProductService,
  ) {}

  async createCart(
    userId: string,
    itemDTO: ItemDTO,
    subTotalPrice: number,
    totalPrice: number,
  ): Promise<Cart> {
    const newCart = await this.cartModel.create({
      userId,
      items: [{ ...itemDTO, subTotalPrice }],
      totalPrice,
    });
    return newCart;
  }

  async getCart(userId: string): Promise<CartDocument> {
    const cart = await this.cartModel.findOne({ userId });
    return cart;
  }

  async deleteCart(userId: string): Promise<Cart> {
    const deletedCart = await this.cartModel.findOneAndRemove({ userId });
    return deletedCart;
  }

  private async recalculateCart(cart: CartDocument) {
    cart.totalPrice = 0;
    for (const item of cart.items) {
      let price = (await this.productService.getProduct(item.productId)).price;
      cart.totalPrice += item.quantity * price;
    }
  }

  async addItemToCart(userId: string, itemDTO: ItemDTO): Promise<Cart> {
    const { productId, quantity } = itemDTO;
    const price = (await this.productService.getProduct(productId)).price;
    const subTotalPrice = quantity * price;

    const cart = await this.getCart(userId);

    if (cart) {
      const itemIndex = cart.items.findIndex(
        (item) => item.productId == productId,
      );

      if (itemIndex > -1) {
        const item = cart.items[itemIndex];
        item.quantity = Number(item.quantity) + Number(quantity);
        item.subTotalPrice = item.quantity * price;

        cart.items[itemIndex] = item;
        await this.recalculateCart(cart);
        return cart.save();
      } else {
        cart.items.push({ ...itemDTO, subTotalPrice });
        await this.recalculateCart(cart);
        return cart.save();
      }
    } else {
      const newCart = await this.createCart(
        userId,
        itemDTO,
        subTotalPrice,
        price * quantity,
      );
      return newCart;
    }
  }

  async removeItemFromCart(userId: string, productId: string): Promise<any> {
    const cart = await this.getCart(userId);

    const itemIndex = cart.items.findIndex(
      (item) => item.productId == productId,
    );

    if (itemIndex > -1) {
      cart.items.splice(itemIndex, 1);
      return cart.save();
    }
  }

  async payCart(req) {
    const cart: CartDocument = await this.getCart(req.user.userId);
    const user = await this.userService.findUserById(req.user.userId);
    const url: string = await this.stripeService.createCheckoutSession(cart.totalPrice, user.stripeCustomerId);
    return url;
  }

  async successPayment(req) {
    const cart: CartDocument = await this.getCart(req.user.userId);
    for (const item of cart.items) {
      const product = this.productService.updateProduct(item.productId, {isSold: true});
    }
    return cart;
  }
}
