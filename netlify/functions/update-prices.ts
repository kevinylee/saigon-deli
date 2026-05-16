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

const isValidIdKey = (k: string): boolean => /^[1-9][0-9]*$/.test(k);

const isValidMap = (m: unknown): m is PriceMap => {
  if (!m || typeof m !== "object" || Array.isArray(m)) return false;
  for (const [k, v] of Object.entries(m as Record<string, unknown>)) {
    if (!isValidIdKey(k)) return false;
    if (!isValidPriceCents(v)) return false;
  }
  return true;
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

  if (!isValidMap(variants) || !isValidMap(itemSizes) || !isValidMap(itemAddOns)) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ ok: false, error: "Invalid price payload" }),
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
      .eq("id", Number(id));
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
      .eq("id", Number(id));
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
      .eq("id", Number(id));
    if (error) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ ok: false, updated, partiallyApplied: updated > 0, error: error.message }),
      };
    }
    updated++;
  }

  try {
    const res = await fetch(BUILD_HOOK_URL, { method: "POST" });
    if (!res.ok) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ ok: false, updated, buildHookFailed: true, error: `Build hook returned ${res.status}` }),
      };
    }
  } catch (e: any) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ ok: false, updated, buildHookFailed: true, error: e?.message ?? "Build hook fetch failed" }),
    };
  }

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({ ok: true, updated }),
  };
};

export { handler };
