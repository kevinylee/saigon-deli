import currency from 'currency.js';

export function toPrice(cents: number) {
    return currency(cents, { fromCents: true }).format();
}

export const IS_PROD = process.env.GATSBY_ENV === "prod";
export const NETLIFY_FUNCTIONS_URL = (IS_PROD ? "https://saigon-deli.netlify.app" : "http://localhost:9999");
export const APP_URL = (IS_PROD ? "https://saigon-deli.netlify.app" : "http://localhost:8000");
