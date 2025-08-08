import currency from 'currency.js';

export function toPrice(cents: number) {
    return currency(cents, { fromCents: true }).format();
}

export const PRETTY = {
    "extra-meat": "Extra Meat",
    "add-egg": "Add Egg",
    "small": "Small",
    "large": "Large",
    "one-size": ""
}