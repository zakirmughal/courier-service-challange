export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}

export class UndeliverablePackageError extends Error {
  constructor(public readonly packageId: string, weight: number, maxWeight: number) {
    super(`Package ${packageId} (${weight}kg) exceeds vehicle capacity (${maxWeight}kg) and cannot be delivered`);
    this.name = "UndeliverablePackageError";
  }
}
