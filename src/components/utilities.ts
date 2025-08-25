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

export const IS_PROD = process.env.GATSBY_ENV === "prod";
export const BASE_URL = (IS_PROD ? "https://saigon-deli.netlify.app" : "http://localhost:9999");
export const BASE_SOUND_URL = (IS_PROD ? "https://saigon-deli.netlify.app" : "http://localhost:8000");
export const BUILD_HOOK_URL = "https://api.netlify.com/build_hooks/622d646f7dc132426ac0f0ee?trigger_branch=main&trigger_title=triggered+by+store+status+change";
