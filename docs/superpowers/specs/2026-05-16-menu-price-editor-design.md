# Menu Price Editor — Design

## Purpose

Give the restaurant owner a UI to update menu prices and push them to the live website without touching Supabase directly. The site is SSG (Gatsby), so price changes require a Netlify rebuild — the editor handles both the database write and the rebuild trigger in a single action.

## Users

The dashboard operator is an older individual who is not comfortable with technology. Every design decision below is constrained by that: plain language, always-visible affordances, explicit confirmations, no clever interactions.

## Scope

In scope:

- Edit variant base prices (`Variants.base_price`).
- Edit per-item size add-on prices (`ItemSizes.add_price`) where editable.
- Edit per-item add-on prices (`ItemAddOns.add_price`).
- Trigger a Netlify rebuild after a successful save.

Out of scope (do not implement):

- Adding or removing variants, sizes, or add-ons.
- Editing item titles, descriptions, availability, or section ordering.
- Multi-user collaboration, audit log, edit history.
- Automated tests (the repo has none today).

## Placement

A new tab inside the existing `/dashboard` route (`src/templates/dashboard.jsx`). Reuses the existing password gate (`netlify/functions/auth.ts`, `NETLIFY_PASSWORD`). No new auth.

The dashboard gains a simple two-tab switcher at the top:

- **Orders** — today's existing view (order list + Settings).
- **Menu Prices** — new view (this spec).

Only one tab is mounted at a time. Switching tabs while the Menu Prices tab has unsaved changes triggers the same browser-level "leave page?" dialog as a hard navigation (handled by `beforeunload`).

## Data model

Prices are stored in cents across three tables:

| Table | Column | Editable when |
|---|---|---|
| `Variants` | `base_price` | Always (every variant has one) |
| `ItemSizes` | `add_price` | `add_price` is a positive integer (not `null`, not `0`) |
| `ItemAddOns` | `add_price` | Always (per-item add-on) |

`ItemSizes` rows with `add_price = null` represent single-size items — they have no add-on price and are not rendered as editable rows. Rows with `add_price = 0` represent the default size in a multi-size item — they tie to the variant's base price and are not rendered as editable rows.

Read path: the existing `GET /.netlify/functions/gsheets` endpoint returns the full `Sections → Items → Variants/ItemSizes/ItemAddOns` tree. No new read endpoint.

## Layout

```
┌─ Dashboard ──────────────────────────────────┐
│ [Orders]  [Menu Prices]                      │
├──────────────────────────────────────────────┤
│ ◆ STATUS BANNER (when active)                │
│                                              │
│  Appetizers                            ← sticky
│    Spring Rolls — Goi Cuon                   │
│      Current: $7.95   New: [$ 7.95   ]       │
│    ...                                       │
│                                              │
│  Pho                                   ← sticky
│    Pho Tai — beef brisket                    │
│      Current: $14.50  New: [$ 14.50  ]       │
│      Large size add: +$2.00  [$ 2.00  ]      │
│    ...                                       │
│    Item add-ons:                             │
│      Extra Meat  +$3.00  [$ 3.00  ]          │
│                                              │
├──────────────────────────────────────────────┤
│ [Discard Changes]    [Update Prices on Website]│
└──────────────────────────────────────────────┘
```

- All editable rows render a `$`-prefixed number input. Inputs are always visible — never hover- or focus-revealed.
- Each row shows the **current live price** (read at page-load time) alongside the input so the user can see what they are changing from.
- Section headers stick to the top of the viewport while scrolling.
- Sections render in the order returned by the API (matches the customer-facing menu).
- A row with an edit applied gets a colored left border and a small "changed" marker.

## Edit, save, discard flow

- Typing in any input updates a `pendingEdits` object in component state, keyed by row identity:
  ```ts
  type PendingEdits = {
    variants: Record<number, number>;     // variant_id -> cents
    itemSizes: Record<number, number>;    // item_size_id -> cents
    itemAddOns: Record<number, number>;   // item_addon_id -> cents
  };
  ```
- `pendingEdits` lives in React state only. There is no localStorage persistence. Reloading the tab discards all edits.
- A `beforeunload` listener is registered whenever `pendingEdits` is non-empty. The listener returns a string to trigger the browser's standard "are you sure you want to leave?" dialog. This is the only safety net against accidental navigation.
- **Discard Changes** is enabled when `pendingEdits` is non-empty. Clicking it opens a confirmation modal:
  > "Throw away your changes? This cannot be undone."
  > [Keep editing]  [Throw away changes]

  Confirming clears `pendingEdits`.

## Update flow

Clicking **Update Prices on Website** opens a confirmation modal listing every change in plain English, sorted by section/item:

```
You are about to update 3 prices on the website:

  • Pho Tai — beef brisket
      Base price: $14.50  →  $15.00
  • Pho Tai — large size
      Add-on price: $2.00  →  $2.50
  • Banh Mi — pork
      Base price: $9.00  →  $9.50

The website will show the new prices in about 2 minutes.

         [Cancel]    [Yes, update the website]
```

Confirming calls `POST /.netlify/functions/update-prices` with the full `pendingEdits` payload and the password (sent in the request body, matching the pattern in `auth.ts` and the existing `schedules.ts`).

Server-side, the function:

1. Validates the password against `NETLIFY_PASSWORD`. Returns 401 on mismatch.
2. Validates each price: positive integer cents, ≥ 1, ≤ 99999. Rejects the entire batch on any invalid value.
3. Verifies each referenced row exists in its table. Rejects the entire batch on any missing id.
4. Issues three Supabase `UPDATE` queries (one per table), each with the new values. These are not wrapped in a transaction — see "Partial-failure handling" below.
5. Only if all three updates succeed, POSTs to the Netlify build hook. The hook URL is defined as a constant inside `update-prices.ts` (server-side code does not import from `src/components/utilities.ts`). It uses the same hook ID as the existing `REBUILD_BUILD_HOOK_URL` but with a distinct `trigger_title=triggered+by+price+update` query parameter so price-driven deploys are visible in the Netlify deploy log.
6. Returns `{ ok: true, updated: <count> }`.

On client success: clear `pendingEdits`, switch the status banner to the green "Done!" state.

On client failure: keep `pendingEdits` intact, switch the status banner to the red error state with a "Try again" button.

## Status banner

A single fixed bar at the top of the Menu Prices tab. States:

| State | Banner text | Color |
|---|---|---|
| Idle (no edits) | (hidden) | — |
| Has edits | "You have X unsaved changes. Click 'Update Prices on Website' when you're ready." | Yellow |
| Saving | "Saving... please wait. Do not close this window." | Blue |
| Just published | "Done! Prices will update on the website in about 2 minutes." (dismissable) | Green |
| Error | "Something went wrong. Your changes are still here. [Try again]" | Red |

## Validation & input behavior

- Inputs accept dollar amounts with up to two decimals (e.g. `15.00`). Internally converted to cents for storage and transport.
- Range: $0.01 to $999.99 inclusive.
- Out-of-range or non-numeric input shows red helper text directly under the input: "Enter a price between $0.01 and $999.99."
- The **Update Prices on Website** button is disabled while any input is invalid.
- Empty input is treated as invalid (not as "no change") — prevents accidental zero-out.

## Partial-failure handling

The Supabase JS client does not expose multi-table transactions, so the three `UPDATE` queries are issued sequentially. Failure modes:

- **First update fails**: build hook is not fired. Server returns 500 with `{ ok: false, updated: 0 }`. Client shows error banner; `pendingEdits` retained.
- **First succeeds, second fails**: build hook is not fired. Server returns 500 with `{ ok: false, updated: <count>, partiallyApplied: true }`. Client shows error banner with text "Something went wrong. Some prices may have updated. Click 'Try again' to finish." Retrying re-sends the full `pendingEdits` payload — the updates are idempotent (we always send the target value, never a diff), so re-applying already-applied changes is harmless.
- **All updates succeed, build hook fails**: server returns 500 with `{ ok: false, updated: <count>, buildHookFailed: true }`. Client shows a distinct error message: "Your prices were saved but the website did not start updating. Contact the developer." (Manual rebuild via the existing "Rebuild Website" button is the recovery path.)

There is no audit log. Acceptable for a single-operator restaurant.

## Concurrent edits

Out of scope. One operator at a time. If two tabs are open with edits in both, last-write-wins. The "Current" column on the screen reflects the state at page load; we do not refresh it.

## New code surface

| File | Purpose |
|---|---|
| `netlify/functions/update-prices.ts` | New function: auth + validate + write + build-hook trigger. |
| `src/components/dashboard/MenuPrices.jsx` | Main editor component. Owns `pendingEdits`. |
| `src/components/dashboard/MenuPriceRow.jsx` | One editable row (used for variants, size deltas, and add-ons). |
| `src/components/dashboard/ConfirmModal.jsx` | Generic confirm dialog. Used by both Discard and Update flows. |
| `src/components/dashboard/StatusBanner.jsx` | Fixed top-of-tab banner with the five states above. |
| `src/components/dashboard/menuPrices.scss` | Styles for the editor tab. |
| `src/templates/dashboard.jsx` | Modified: add two-tab switcher (Orders / Menu Prices). |

## Testing

Manual smoke test against `npx gatsby develop` + `npx netlify functions:serve`:

- Edit three prices across all three categories (variant, size, add-on) → Update → confirm modal shows correct diffs → confirm → Supabase rows updated → Netlify build hook fires (verify in Netlify dashboard).
- Edit and reload the tab → edits are gone, no restore prompt.
- Edit and try to navigate away or close the tab → browser shows native "leave page?" dialog.
- Edit and click Discard → confirm modal → confirm → edits cleared, banner returns to idle.
- Type `-1`, `0`, `1000`, and `abc` into a price input → red helper text → Update button disabled.
- Tear down `SUPABASE_PRIVATE_KEY` locally → click Update → red error banner appears, edits preserved.

No automated tests are added. The repo has none, and introducing a test runner is out of scope for this work.

## Open questions

None at this time.
