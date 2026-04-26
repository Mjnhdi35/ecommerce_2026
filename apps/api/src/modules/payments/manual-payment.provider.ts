import crypto from "crypto";

export interface ProviderPaymentIntent {
  clientSecret: string;
  providerPaymentId: string;
}

export class ManualPaymentProvider {
  public createIntent(): ProviderPaymentIntent {
    const providerPaymentId = `manual_${crypto.randomUUID()}`;

    return {
      clientSecret: crypto.randomBytes(32).toString("hex"),
      providerPaymentId,
    };
  }

  public confirm(): true {
    return true;
  }
}
