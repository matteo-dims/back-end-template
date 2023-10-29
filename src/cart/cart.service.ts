import {Injectable} from '@nestjs/common';
import {Model} from 'mongoose';
import {InjectModel} from '@nestjs/mongoose';
import {Cart, CartDocument} from './schemas/cart.schema';
import {ItemDTO} from './dtos/item.dto';
import {StripeService} from 'src/stripe/stripe.service';
import {UserService} from 'src/user/user.service';
import {ProductService} from 'src/product/product.service';
import {CartState} from './enums/cartState.enum';
import {ErrorTemplate} from 'src/utils/error.dto';
import {CartBulkDTO} from './dtos/cartBulk.dto';

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
    try {
      return await this.cartModel.create({
        userId,
        items: [{...itemDTO, subTotalPrice}],
        totalPrice,
        cartState: CartState.Normal
      });
    } catch (error) {
      if (error instanceof ErrorTemplate)
        throw error;
      else
        throw new ErrorTemplate(400, error.message || `Can\'t create a new cart for user : ${userId}.`, 'Cart');
    }
  }

  async getAllCarts(): Promise<CartBulkDTO[]> {
    try {
      const carts = await this.cartModel.find().exec();
      let finalCarts: CartBulkDTO[] = [];
      for (let cart of carts) {
        let tmpCart: CartBulkDTO = new CartBulkDTO();
        tmpCart.items = [];
        tmpCart._id = cart._id;
        tmpCart.cartState = cart.cartState;
        tmpCart.totalPrice = cart.totalPrice;
        tmpCart.userId = cart.userId;
        for (let item of cart.items) {
          const product = await this.productService.getProduct(item.productId);
            tmpCart.items.push(
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
        finalCarts.push(tmpCart);
      }
      return finalCarts;
    } catch (error) {
      if (error instanceof ErrorTemplate)
        throw error;
      else
        throw new ErrorTemplate(400, error.message || `Can't get carts.`, 'Cart');
    }
  }
  

  async getCart(userId: string): Promise<CartDocument> {
    try {
      return await this.cartModel.findOne({userId, cartState: CartState.Normal});
    } catch (error) {
      if (error instanceof ErrorTemplate)
        throw error;
      else
        throw new ErrorTemplate(400, error.message || `Can\'t get cart for user : ${userId}.`, 'Cart');
    }
  }

  async getAllCartOfUser(userId: string): Promise<CartDocument[]> {
    try {
      return await this.cartModel.find({userId});
    } catch (error) {
      if (error instanceof ErrorTemplate)
        throw error;
      else
        throw new ErrorTemplate(400, error.message || `Can\'t get cart for user : ${userId}.`, 'Cart');
    }
  }

  async deleteCart(userId: string): Promise<Cart> {
    try {
      return await this.cartModel.findOneAndRemove({userId});
    } catch (error) {
      if (error instanceof ErrorTemplate)
        throw error;
      else
        throw new ErrorTemplate(400, error.message || `Can\'t delete cart for user : ${userId}.`, 'Cart');
    }
  }

  private async recalculateCart(cart: CartDocument) {
    cart.totalPrice = 0;
    for (const item of cart.items) {
      let price = (await this.productService.getProduct(item.productId)).price;
      cart.totalPrice += item.quantity * price;
    }
  }

  async addItemToCart(userId: string, itemDTO: ItemDTO): Promise<any> {
    try {

      const { productId, quantity } = itemDTO;
      const product = await this.productService.getProduct(productId);
      const price = product.price;
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
        return await this.createCart(
            userId,
            itemDTO,
            subTotalPrice,
            price * quantity,
        );
      }
    }  catch (error) {
      if (error instanceof ErrorTemplate)
        throw error;
      else
        throw new ErrorTemplate(400, error.message || `Can\'t add a new item in the cart of user : ${userId}.`, 'Cart');
    }
  }

  async removeItemFromCart(userId: string, productId: string): Promise<any> {
    try {
      const cart = await this.getCart(userId);
  
      const itemIndex = cart.items.findIndex(
        (item) => item.productId == productId,
      );
  
      if (itemIndex > -1) {
        cart.items.splice(itemIndex, 1);
        return cart.save();
      }
    } catch (error) {
      if (error instanceof ErrorTemplate)
        throw error;
      else
        throw new ErrorTemplate(400, error.message || `Can\'t remove item : ${productId} from cart for user : ${userId}.`, 'Cart');
    }
  }

  async payCart(req) {
    try {
      const cart: CartDocument = await this.getCart(req.user.userId);
      if (!cart) {
        throw new ErrorTemplate(400, `Can\'t find a cart for user : ${req.user.userId}.`, 'Cart');
      }
      const user = await this.userService.findUserById(req.user.userId);
      const url: string = await this.stripeService.createCheckoutSession(cart.totalPrice, user.stripeCustomerId);
      cart.cartState = CartState.Pending;
      cart.save();
      return url;
    }  catch (error) {
      if (error instanceof ErrorTemplate)
        throw error;
      else
        throw new ErrorTemplate(400, error.message || `Can\'t create a payment method for user : ${req.user.userId}.`, 'Cart');
    }
  }

  async statusPayment(req, sessionId: string) {
    try {
      const cart: CartDocument[] = await this.getAllCartOfUser(req.user.userId);
      const rightCart = cart.find((element) => {
        return element.cartState === CartState.Pending
      });
      const stripeResponse = await this.stripeService.checkCheckoutStatusSession(sessionId);
      if (stripeResponse.status === 'open') {
        rightCart.cartState = CartState.Normal;
      } else if (stripeResponse.status === 'complete') {
        for (const item of rightCart.items) {
          await this.productService.updateProduct(item.productId, {isSold: true});
        }
        rightCart.cartState = CartState.Paid;
      }
      rightCart.save();
      return stripeResponse;
    } catch (error) {
      if (error instanceof ErrorTemplate)
        throw error;
      else
        throw new ErrorTemplate(400, error.message || `Can\'t update status of cart for user : ${req.user.userId}.`, 'Cart');
    }
  }
}
