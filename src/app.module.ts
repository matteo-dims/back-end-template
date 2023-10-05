import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ProductModule } from './product/product.module';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { CartModule } from './cart/cart.module';
import { S3ManagerModule } from './s3-manager/s3-manager.module';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://root:root@localhost:27017', {dbName: 'store'}),
    ProductModule,
    UserModule,
    AuthModule,
    CartModule,
    S3ManagerModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
