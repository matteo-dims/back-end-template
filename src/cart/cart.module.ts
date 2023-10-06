import { Module } from '@nestjs/common';
import { CartController } from './cart.controller';
import { CartService } from './cart.service';
import { MongooseModule } from '@nestjs/mongoose';
import { CartSchema } from './schemas/cart.schema';
import { StripeModule } from 'src/stripe/stripe.module';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [
    StripeModule,
    UserModule,
    MongooseModule.forFeature([{ name: 'Cart', schema: CartSchema }]),
  ],
  controllers: [CartController],
  providers: [CartService],
})
export class CartModule {}
