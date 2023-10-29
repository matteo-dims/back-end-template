import { Injectable } from '@nestjs/common';
import {MailerService} from "@nestjs-modules/mailer";
@Injectable()
export class MailService {
    constructor(private mailerService: MailerService) {}

    async sendUserConfirmation(email: string, name: string) {
        const url: string = `https://bestofy.fr`;

        await this.mailerService.sendMail({
            to: email,
            // from: '"Support Team" <support@example.com>', // override default from
            subject: 'Welcome to Back-end Template Confirm your Email',
            template: './confirmation', // `.hbs` extension is appended automatically
            context: { // ✏️ filling curly brackets with content
                name: name,
                url,
            },
        });
    }
}
