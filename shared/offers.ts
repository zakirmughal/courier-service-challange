import { Offer } from "./types";

export const OFFERS: Record<string, Offer> = {
  OFR001: { discount: 0.1,  minDistance: 0,  maxDistance: 199, minWeight: 70,  maxWeight: 200 },
  OFR002: { discount: 0.07, minDistance: 50, maxDistance: 150, minWeight: 100, maxWeight: 250 },
  OFR003: { discount: 0.05, minDistance: 50, maxDistance: 250, minWeight: 10,  maxWeight: 150 },
};
