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
            ui_mode: 'embedded',
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
            return_url: process.env.ENV === 'dev' ? "http://localhost:3001/getCart/status?session_id={CHECKOUT_SESSION_ID}" : "https://template-front.vercel.app/getCart/status?session_id={CHECKOUT_SESSION_ID}",
        });
          return stripeResponse.client_secret;
      } catch (error) {
        throw new ErrorTemplate(500, error.message || 'Can\'t create a new stripe checkout session.', 'Stripe');
      }
    }

    public async checkCheckoutStatusSession(sessionId: string) {
        try {
            const session = await this.stripe.checkout.sessions.retrieve(sessionId);
            return ({status: session.status, payment_status: session.payment_status});
        } catch (error) {
            throw new ErrorTemplate(500, error.message || `Can\'t validate session: ${sessionId}.`, 'Stripe');
        }
    }
}
