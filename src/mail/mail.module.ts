import {MailerModule} from '@nestjs-modules/mailer';
import {HandlebarsAdapter} from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import {Module} from '@nestjs/common';
import {MailService} from './mail.service';
import { join } from 'path';
import * as process from "process";

@Module({
    imports: [MailerModule.forRoot({
        // transport: 'smtps://user@example.com:topsecret@smtp.example.com',
        // or
        transport: {
            host: 'smtp.gmail.com',
            secure: false,
            auth: {
                user: process.env.NODEMAILER_EMAIL,
                pass: process.env.NODEMAILER_PW,
            },
        },
        defaults: {
            from: '"No Reply" <noreply@example.com>',
        },
        template: {
            dir: join(__dirname, 'templates'),
            adapter: new HandlebarsAdapter(), // or new PugAdapter() or new EjsAdapter()
            options: {
                strict: true,
            },
        },
    }),],
    providers: [MailService],
    exports: [MailService],
})
export class MailModule {
}
