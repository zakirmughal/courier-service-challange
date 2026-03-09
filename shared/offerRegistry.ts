import { Offer } from "./types";

// O — Open/Closed: new offers can be registered without modifying this class or the calculator
export class OfferRegistry {
  private readonly offers = new Map<string, Offer>();

  register(code: string, offer: Offer): this {
    this.offers.set(code, offer);
    return this; // fluent API — allows chaining .register().register()
  }

  get(code: string): Offer | undefined {
    return this.offers.get(code);
  }
}
