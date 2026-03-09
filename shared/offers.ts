import { Offer } from "./types";
import { OfferRegistry } from "./offerRegistry";

// Kept for Problem 1 backward compatibility
export const OFFERS: Record<string, Offer> = {
  OFR001: { discount: 0.1,  minDistance: 0,  maxDistance: 199, minWeight: 70,  maxWeight: 200 },
  OFR002: { discount: 0.07, minDistance: 50, maxDistance: 150, minWeight: 100, maxWeight: 250 },
  OFR003: { discount: 0.05, minDistance: 50, maxDistance: 250, minWeight: 10,  maxWeight: 150 },
};

// O — Open/Closed: add new offers by calling .register() — no existing code needs to change
export const offerRegistry = new OfferRegistry()
  .register("OFR001", OFFERS.OFR001)
  .register("OFR002", OFFERS.OFR002)
  .register("OFR003", OFFERS.OFR003);
