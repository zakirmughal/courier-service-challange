import { PackageResult } from "../../shared/types";

export interface FleetConfig {
  vehicleCount: number;
  maxSpeed: number;
  maxWeight: number;
}

export interface DeliveryResult extends PackageResult {
  estimatedDeliveryTime: number;
}
