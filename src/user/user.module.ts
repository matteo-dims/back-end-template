import {Module} from '@nestjs/common';
import {MongooseModule} from '@nestjs/mongoose';
import {UserSchema} from './schemas/user.schema';
import {UserService} from './user.service';
import {StripeModule} from 'src/stripe/stripe.module';
import {MailModule} from "../mail/mail.module";

@Module({
    imports: [
        StripeModule,
        MailModule,
        MongooseModule.forFeature([{name: 'User', schema: UserSchema}]),
    ],
    providers: [UserService],
    exports: [UserService],
})
export class UserModule {
}
