import { DirectDebitProvider } from './directDebit';
import { GoCardlessProvider } from './goCardless';
import { PayPalProvider } from './paypal';
import { StripeProvider } from './stripe';
import { PaymentMethod, IPaymentProvider } from './types';

export * from './types';

export class PaymentProviderFactory {
  private static providers: Record<PaymentMethod, IPaymentProvider> = {
    DIRECT_DEBIT: new DirectDebitProvider(),
    GOCARDLESS: new GoCardlessProvider(),
    PAYPAL: new PayPalProvider(),
    STRIPE: new StripeProvider()
  };

  static getProvider(method: PaymentMethod): IPaymentProvider {
    const provider = this.providers[method];
    if (!provider) {
      throw new Error(`Payment provider not found for method: ${method}`);
    }
    return provider;
  }
}


