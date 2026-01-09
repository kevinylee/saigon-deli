import currency from 'currency.js';
import addOns from '../../catalog/add-ons.json'
import sizes from '../../catalog/sizes.json'

export function toPrice(cents: number) {
    return currency(cents, { fromCents: true }).format();
}

const createMappings = (data: Array<any>) => data.reduce((acc, cur) => {
    if (!acc[cur.id]) {
        acc[cur.id] = cur.title
    }

    return acc;
}, {})

export const addOnMapping = createMappings(addOns);
export const sizeMapping = createMappings(sizes);

export const PRETTY = {
    ...addOnMapping,
    ...sizeMapping
}

export const IS_PROD = process.env.GATSBY_ENV === "prod";
export const BASE_URL = (IS_PROD ? "https://saigon-deli.netlify.app" : "http://localhost:9999");
export const BASE_SOUND_URL = (IS_PROD ? "https://saigon-deli.netlify.app" : "http://localhost:8000");
export const STORE_STATUS_BUILD_HOOK_URL = "https://api.netlify.com/build_hooks/622d646f7dc132426ac0f0ee?trigger_branch=main&trigger_title=triggered+by+store+status+change";
export const REBUILD_BUILD_HOOK_URL = "https://api.netlify.com/build_hooks/622d646f7dc132426ac0f0ee?trigger_branch=main&trigger_title=rebuild";
