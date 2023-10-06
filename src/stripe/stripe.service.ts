import { Injectable } from '@nestjs/common';
import Stripe from 'stripe';

@Injectable()
export class StripeService {
    private stripe: Stripe;

    constructor(
    ) {
        this.stripe = new Stripe(process.env["STRIPE_SECRET_KEY"], {
            "apiVersion": '2023-08-16',
        });
    }

    public async createCustomer(name: string, email: string) {
        return this.stripe.customers.create({
            name,
            email
        });
    }

    public async createCheckoutSession(amount: number, customerId: string) {
        const stripeResponse = await this.stripe.checkout.sessions.create({
            line_items: [
                {
                  price_data: {
                    currency: process.env.STRIPE_CURRENCY,
                    unit_amount: amount * 100,
                    product_data: {
                      name: "product test",
                    },
                  },
                  quantity: 1,
                },
              ],
              customer: customerId,
              mode: "payment",
              success_url: "https://www.google.com",
              cancel_url: "https://www.bestofy.fr",
        });
        return stripeResponse.url;
    }
}
