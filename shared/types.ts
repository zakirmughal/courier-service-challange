export interface Offer {
  discount: number; // decimal, e.g. 0.10 = 10%
  minDistance: number;
  maxDistance: number;
  minWeight: number;
  maxWeight: number;
}

export interface Package {
  id: string;
  weight: number;
  distance: number;
  offerCode: string;
}

export interface PackageResult {
  id: string;
  discount: number;
  totalCost: number;
}
