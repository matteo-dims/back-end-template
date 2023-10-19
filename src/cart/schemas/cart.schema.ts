import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, SchemaTypes } from 'mongoose';
import { Item } from './item.schema';
import { CartState } from '../enums/cartState.enum';

export type CartDocument = Cart & Document;

@Schema()
export class Cart {
  @Prop({ type: SchemaTypes.ObjectId, ref: 'User' })
  userId: string;

  @Prop()
  items: Item[];

  @Prop()
  totalPrice: number;

  @Prop()
  cartState: CartState;
}

export const CartSchema = SchemaFactory.createForClass(Cart);
