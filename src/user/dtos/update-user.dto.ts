export class UpdateUserDto {
    username?: string;
    email?: string;
    password?: string;
    stripeCustomerId?: string;
    instagramCredentials?: string;
}

export class InstagramCredentials {
    username: string;
    password: string;
}
