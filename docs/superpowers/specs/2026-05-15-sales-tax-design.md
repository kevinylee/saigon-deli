# Sales Tax Collection — Design Spec

**Date:** 2026-05-15
**Status:** Approved (pending spec review)
**Author:** Aaron Chen (with Claude)

## Summary

Collect Seattle, WA combined sales tax (10.55%) on every Stripe Checkout
order. Tax is applied to food line items only — tips are not taxed.
Tax is calculated and displayed before tip in both the in-app checkout
modal and the Stripe Checkout page. Implementation uses a Stripe
`TaxRate` object attached server-side to each food line item, plus a
client-side preview that mirrors Stripe's per-line rounding.

## Goals

- Charge 10.55% sales tax on food on every order.
- Match Stripe's tax math exactly in the client-side preview (no
  surprise totals on the Stripe Checkout page).
- Exclude tips from tax (tip is a service fee, not a taxable item).
- Show a clear breakdown — Subtotal / Sales Tax / Tip / Total — in
  the CheckoutModal footer, on the Stripe Checkout page, on the
  receipt page, and in the admin dashboard.
- Make the rate easy to update without code changes when the WA rate
  shifts.

## Non-goals

- Multi-jurisdiction tax (only Seattle, WA).
- Automatic tax calculation by customer address (out of scope —
  pickup-only restaurant).
- Backfilling tax onto pre-existing orders in Supabase.
- Stripe Tax (the automatic product). Manual TaxRate only.

## Architecture overview

### Money flow

```
cart subtotal (Σ food line_cents)
    │
    ├──► tax = Σ round(line_cents × 10.55%)   ← per-line rounding,
    │                                            matches Stripe TaxRate
    │
    └──► tip = preset% × subtotal (pre-tax)   ← tip not taxed

Total = subtotal + tax + tip
```

### Responsibility split

| Layer | Responsibility |
|---|---|
| Client (`CheckoutModal.jsx`) | Preview math, footer breakdown UI, tip input |
| Server (`netlify/functions/checkout.ts`) | Attach `STRIPE_TAX_RATE_ID` to food line items; tip line item omits `tax_rates` |
| Stripe Checkout | Authoritative tax calculation, dedicated tax row on hosted page |
| Server (`netlify/functions/webhook.ts`) | Persist synthetic Sales Tax entry into `array_line_items` from `session.total_details.amount_tax` |
| Server (`netlify/functions/receipt.ts`) | Return tax as a separate API field |
| Client (`receipt.jsx`) | Render tax in `<tfoot>` above Total |
| Client (`dashboard/Order.jsx`) | Look up Sales Tax row in `array_line_items`, render alongside Tip |

## One-time Stripe setup

In the Stripe Dashboard (or via API), create a TaxRate:

- `display_name`: "WA Sales Tax"
- `percentage`: 10.55
- `inclusive`: false
- `jurisdiction`: "WA"
- `country`: "US"

Capture the resulting `txr_…` ID for the `STRIPE_TAX_RATE_ID` env var.

## Configuration

Two env vars, one client and one server. They MUST be kept in sync —
if Stripe's TaxRate differs from `GATSBY_TAX_RATE_PERCENT`, the modal
preview will not match the Stripe Checkout page.

| Variable | Scope | Example | Purpose |
|---|---|---|---|
| `GATSBY_TAX_RATE_PERCENT` | Client (Gatsby-prefixed, bundled) | `10.55` | Preview math + "(10.55%)" label |
| `STRIPE_TAX_RATE_ID` | Server only (Netlify functions) | `txr_1Abc…` | Attached to food line_items |

**README note (to add):** "If the WA sales tax rate changes, update
BOTH the Stripe Dashboard TaxRate and `GATSBY_TAX_RATE_PERCENT`."

**Client fallback:** `Number(process.env.GATSBY_TAX_RATE_PERCENT) || 10.55`
so a missing env var in dev still renders the correct rate.

**Server check:** Add `STRIPE_TAX_RATE_ID` to the existing env-vars-
required check at the top of `checkout.ts`. If missing, the function
throws on cold start.

## Component changes

### `src/components/CheckoutModal.jsx`

Replace lines 38–40 with:

```js
const TAX_RATE_PERCENT = Number(process.env.GATSBY_TAX_RATE_PERCENT) || 10.55;

const cartSubtotal = cart.reduce((acc, li) =>
  acc + (li.quantity * li.purchaseable.unitPrice), 0);

// Per-line rounding to match Stripe's TaxRate calculation exactly
const taxCents = cart.reduce((acc, li) => {
  const lineCents = li.quantity * li.purchaseable.unitPrice;
  return acc + Math.round(lineCents * TAX_RATE_PERCENT / 100);
}, 0);

const tipCents = Math.round(Math.max(0, tipAmount) * 100);
const totalPrice = cartSubtotal + taxCents + tipCents;
```

Tip preset buttons unchanged (`cartSubtotal * pct / 100`) — confirmed
pre-tax base.

Replace the footer (lines 114–129) with a four-row breakdown:

```
Subtotal           $24.00
Sales Tax (10.55%)  $2.53
Tip   [input]       $3.60
─────────────────────────
Total              $30.13
```

The tip input moves inside the Tip row of the totals block.

SCSS additions to `checkout.scss`:

- `.checkout-totals` — column flex container
- `.totals-row` — row flex (label left, amount right), muted color
- `.total-row` — top border, larger weight
- `.tip-row .tip-form` — reuse existing tip-form/tip-input styles

Empty cart edge: subtotal/tax/tip all render `$0.00`. Checkout button
already disabled when `cart.length <= 0`.

### `netlify/functions/checkout.ts`

Add to env check (line 8–10):

```ts
if (!process.env.STRIPE_SECRET || !DOMAIN ||
    !process.env.SUPABASE_API_URL || !process.env.SUPABASE_PRIVATE_KEY ||
    !process.env.STRIPE_TAX_RATE_ID) {
  throw "Missing required env vars (Stripe / Supabase / base URL / tax rate).";
}
const STRIPE_TAX_RATE_ID = process.env.STRIPE_TAX_RATE_ID;
```

Attach `tax_rates` only to food line items (line 96–109):

```ts
return {
  price_data: {
    currency: 'USD',
    unit_amount: purchaseable.unitPrice,
    product_data: { /* unchanged */ }
  },
  quantity: lineItem.quantity,
  tax_rates: [STRIPE_TAX_RATE_ID]
};
```

The Tip branch (line 82–91) is unchanged — no `tax_rates` means tip
is excluded from Stripe's tax calculation.

`stripe.checkout.sessions.create` call (line 112) is unchanged.
TaxRate's `inclusive: false` means tax is added on top; `session.amount_total`
includes it.

### `netlify/functions/webhook.ts`

After existing line-item collection (line 65–79), append a synthetic
Sales Tax row when present:

```ts
const taxAmount = session.total_details?.amount_tax ?? 0;
if (taxAmount > 0) {
  array_line_items.push({
    title: 'Sales Tax',
    quantity: 1,
    unit_price: null,
    currency: 'usd',
    amount_total: taxAmount
  });
}
```

`session.amount_total` (line 85, already stored as `total_amount`) is
already tax-inclusive — no change there. No schema migration.

### `netlify/functions/receipt.ts`

Return tax as a separate field. Update both code paths in
`getReceiptData`:

```ts
// Supabase branch
const tax = data.array_line_items
  .find(li => li.title === 'Sales Tax')?.amount_total ?? 0;
const itemsOnly = data.array_line_items.filter(li => li.title !== 'Sales Tax');
return [itemsOnly.map(normalizeLineItem), data.pickup_at, tax];

// Stripe fallback branch
const tax = checkoutSession.total_details?.amount_tax ?? 0;
return [
  lineItemPayload.data.map(normalizeLineItem),
  checkoutSession.metadata?.pickup_time,
  tax
];
```

Update handler return body:

```ts
body: JSON.stringify({ lineItems, pickupTime, tax })
```

### `src/pages/receipt.jsx`

Extend state to include tax:

```js
const [order, setOrder] = useState({
  lineItems: [], tax: 0, loading: true, pickupTime: null
});
// in fetch:
setOrder({
  lineItems: response.data.lineItems,
  tax: response.data.tax ?? 0,
  pickupTime: response.data.pickupTime,
  loading: false
});
```

`Success` component takes `tax` prop. Total sums the line items directly — **do not add `tax` again**:

```js
const totalPrice = order.reduce((p, c) => p + c.amount_total, 0);
```

Stripe's `LineItem.amount_total` is tax-inclusive for an exclusive `TaxRate`
(`amount_total = amount_subtotal + amount_tax`), and the webhook persists that
value. The Sales Tax row in the `<tfoot>` is purely informational so the
customer can see the breakdown — adding it on top of line items would
double-count.

`<tfoot>` renders a Sales Tax row above Total when `tax > 0`:

```jsx
<tfoot>
  {tax > 0 && (
    <tr>
      <td>Sales Tax</td>
      <td className="amountTotal">{toPrice(tax)}</td>
    </tr>
  )}
  <tr>
    <td><b>Total:</b></td>
    <td className="amountTotal"><b>{toPrice(totalPrice)}</b></td>
  </tr>
</tfoot>
```

No filter needed on `order.map()` — Sales Tax is no longer in the
array at this layer.

### `src/components/dashboard/Order.jsx`

Rename filter and find tax row:

```js
const filterAdjustments = (li) => li.title !== 'Tip' && li.title !== 'Sales Tax';
const tipLineItem = lineItems.find((item) => item.title === 'Tip');
const taxLineItem = lineItems.find((item) => item.title === 'Sales Tax');
```

Replace `filterTip` with `filterAdjustments` at lines 60 and 102.
Update the price block:

```jsx
<li key="price" className="price">
  <p>
    {taxLineItem && <span>Sales Tax: {toPrice(taxLineItem.amount_total)}<br /></span>}
    {tipLineItem && <span>Tip: {tipLineItem.amount_total != null ? toPrice(tipLineItem.amount_total) : `$${tipLineItem.quantity}`}<br /></span>}
    Total: {toPrice(total_amount)}
  </p>
</li>
```

Order: Sales Tax → Tip → Total (matches modal).

## What does not change

- `Orders` table schema — no migration
- `gsheets.ts`, `orders.ts`, `schedules.ts`, `auth.ts` — none touch
  line items in tax-relevant ways
- `Purchaseable.js`, `LineItem.js` models — no tax concept needed at
  model layer; tax math lives in CheckoutModal and on the server
- Existing `Tip` variant in Supabase — unchanged
- `total_amount` column on Orders — already tax-inclusive via
  `session.amount_total`

## Edge cases and failure modes

| Scenario | Behavior |
|---|---|
| Missing `STRIPE_TAX_RATE_ID` | `checkout.ts` throws on cold start; client sees a 500 from the existing axios call |
| Invalid `STRIPE_TAX_RATE_ID` | `stripe.checkout.sessions.create` errors; client shows the existing alert |
| Missing `GATSBY_TAX_RATE_PERCENT` | Client falls back to `10.55` const |
| Client/server rate drift | Per-line rounding on client matches Stripe exactly when rates match; if mismatched, Stripe Checkout shows the authoritative tax — possible 1¢+ discrepancy with the modal preview |
| Empty cart | Subtotal/tax/tip all $0.00; Checkout button already disabled |
| Pre-existing Supabase orders | No Sales Tax row in `array_line_items` — render with no Tax line (correct; they were never taxed) |
| Webhook hasn't fired yet (receipt.ts fallback path) | Reads `session.total_details.amount_tax` from Stripe — same value the webhook would have persisted |

## Rollout

1. Create the TaxRate in the Stripe Dashboard, capture the ID.
2. Set `STRIPE_TAX_RATE_ID` and `GATSBY_TAX_RATE_PERCENT` in Netlify
   env (production + dev).
3. Merge the code change. No DB migration. No backfill.
4. Verify first real order end-to-end: modal preview → Stripe Checkout
   tax row → webhook persists Sales Tax in `array_line_items` →
   receipt page renders tax → dashboard renders tax.

## Open questions

None outstanding.
