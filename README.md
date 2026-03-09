# Courier Service Challange
A TypeScript CLI application to estimate delivery costs and delivery times for packages.


---

## Project Structure

```
delivery-distance-challange/
├── shared/              # Shared logic (types, errors, offers, calculator)
├── problem1/            # Cost estimation
│   ├── src/
│   └── tests/
├── problem2/            # Delivery time estimation
│   ├── src/
│   └── tests/
├── package.json
└── tsconfig.json
```

---

## Prerequisites

- [Node.js](https://nodejs.org/) v18+
- npm

---

## Setup

```bash
npm install
```

---

## Problem 1 — Cost Estimation

Estimates the total delivery cost for each package with optional offer codes.

**Formula:** `Base Cost + (Weight × 10) + (Distance × 5) − Discount`

**Offer Codes:**

| Code   | Discount | Distance (km) | Weight (kg) |
|--------|----------|---------------|-------------|
| OFR001 | 10%      | < 200         | 70 – 200    |
| OFR002 | 7%       | 50 – 150      | 100 – 250   |
| OFR003 | 5%       | 50 – 250      | 10 – 150    |

### Input Format

```
base_delivery_cost no_of_packages
pkg_id weight_kg distance_km offer_code
...
```

### Run

**Windows CMD** — save input to a file, then redirect:

1. Create `input.txt`:
```
100 3
PKG1 5 5 OFR001
PKG2 15 5 OFR002
PKG3 10 100 OFR003
```
2. Run:
```cmd
npm run p1 < input.txt
```

### Output Format

```
pkg_id discount total_cost
```

### Sample Output

```
PKG1 0 175
PKG2 0 275
PKG3 35 665
```

## Tests

Run all tests:

```bash
npm test:p1
```