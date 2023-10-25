import { Injectable } from '@nestjs/common';
import { ErrorTemplate } from 'src/utils/error.dto';
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
      try {
        return this.stripe.customers.create({
            name,
            email
        });
      } catch (error) {
        throw new ErrorTemplate(500, error.message || 'Can\'t create a new stripe user.', 'Stripe');
      }
    }

    public async createCheckoutSession(amount: number, customerId: string) {
      try {
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
      } catch (error) {
        throw new ErrorTemplate(500, error.message || 'Can\'t create a new stripe checkout session.', 'Stripe');
      }
    }
}
