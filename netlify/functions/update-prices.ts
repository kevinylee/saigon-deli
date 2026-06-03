import { Handler } from "@netlify/functions";
import { createClient } from "@supabase/supabase-js";

const BUILD_HOOK_URL = "https://api.netlify.com/build_hooks/622d646f7dc132426ac0f0ee?trigger_branch=main&trigger_title=triggered+by+price+update";

const headers = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "POST",
};

if (!process.env.SUPABASE_API_URL || !process.env.SUPABASE_PRIVATE_KEY) {
  throw "No Supabase credentials founded.";
}

const supabase = createClient(
  process.env.SUPABASE_API_URL,
  process.env.SUPABASE_PRIVATE_KEY
);

type PriceMap = Record<string, number>;

const isValidPriceCents = (n: unknown): n is number =>
  typeof n === "number" && Number.isInteger(n) && n >= 1 && n <= 99999;

const isValidIdKey = (k: string): boolean =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(k);

// Returns null if valid, else a human-readable reason naming the bad key/value.
const validateMap = (field: string, m: unknown): string | null => {
  if (!m || typeof m !== "object" || Array.isArray(m)) {
    return `${field} must be an object, got ${Array.isArray(m) ? "array" : typeof m}`;
  }
  for (const [k, v] of Object.entries(m as Record<string, unknown>)) {
    if (!isValidIdKey(k)) return `${field} has invalid id key ${JSON.stringify(k)}`;
    if (!isValidPriceCents(v)) {
      return `${field}[${k}] must be an integer in [1, 99999] cents, got ${JSON.stringify(v)} (${typeof v})`;
    }
  }
  return null;
};

const handler: Handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers };
  }
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, headers };
  }

  let payload: any;
  try {
    payload = JSON.parse(event.body || "{}");
  } catch {
    return { statusCode: 400, headers, body: JSON.stringify({ ok: false, error: "Invalid JSON" }) };
  }

  if (payload.password !== process.env.NETLIFY_PASSWORD) {
    return { statusCode: 401, headers, body: JSON.stringify({ ok: false, error: "Unauthorized" }) };
  }

  const variants: PriceMap = payload.variants ?? {};
  const itemSizes: PriceMap = payload.itemSizes ?? {};
  const itemAddOns: PriceMap = payload.itemAddOns ?? {};

  const reason =
    validateMap("variants", variants) ||
    validateMap("itemSizes", itemSizes) ||
    validateMap("itemAddOns", itemAddOns);
  if (reason) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ ok: false, error: `Invalid price payload: ${reason}` }),
    };
  }

  const total =
    Object.keys(variants).length +
    Object.keys(itemSizes).length +
    Object.keys(itemAddOns).length;

  if (total === 0) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ ok: false, error: "No changes" }),
    };
  }

  let updated = 0;

  for (const [id, price] of Object.entries(variants)) {
    const { error } = await supabase
      .from("Variants")
      .update({ base_price: price })
      .eq("id", id);
    if (error) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ ok: false, updated, partiallyApplied: updated > 0, error: error.message }),
      };
    }
    updated++;
  }

  for (const [id, price] of Object.entries(itemSizes)) {
    const { error } = await supabase
      .from("ItemSizes")
      .update({ add_price: price })
      .eq("id", id);
    if (error) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ ok: false, updated, partiallyApplied: updated > 0, error: error.message }),
      };
    }
    updated++;
  }

  for (const [id, price] of Object.entries(itemAddOns)) {
    const { error } = await supabase
      .from("ItemAddOns")
      .update({ add_price: price })
      .eq("id", id);
    if (error) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ ok: false, updated, partiallyApplied: updated > 0, error: error.message }),
      };
    }
    updated++;
  }

  if (process.env.NETLIFY_DEV !== "true") {
    await fetch(BUILD_HOOK_URL, { method: "POST" }).catch(() => {});
  }

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({ ok: true, updated }),
  };
};

export { handler };
