# Menu Price Editor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a "Menu Prices" tab to `/dashboard` that lets a non-technical operator edit variant base prices, per-item size add-ons, and per-item add-on prices, then push the changes to the live site via a single Netlify rebuild.

**Architecture:** A new React tab inside `src/templates/dashboard.jsx` holds in-memory `pendingEdits`. Reads use the existing `/.netlify/functions/gsheets` endpoint (full menu tree). Writes go through a new `/.netlify/functions/update-prices` function that authenticates (shared `NETLIFY_PASSWORD`), validates, performs Supabase `UPDATE`s on `Variants` / `ItemSizes` / `ItemAddOns`, then fires the Netlify build hook only if every update succeeds. No localStorage; a `beforeunload` listener guards against accidental navigation.

**Tech Stack:** Gatsby (React + JSX), Netlify Functions (TypeScript), Supabase, `currency.js` (already a dep) for dollar/cents conversions. No automated test harness — verification is manual via `npx netlify dev` (or `gatsby develop` + `netlify functions:serve`).

**Spec:** [docs/superpowers/specs/2026-05-16-menu-price-editor-design.md](../specs/2026-05-16-menu-price-editor-design.md)

---

## Prerequisites

Before starting Task 1, the engineer needs:

- Local `.env.development` populated with `SUPABASE_API_URL`, `SUPABASE_PRIVATE_KEY`, and `NETLIFY_PASSWORD` (already used by `auth.ts` and `gsheets.ts`).
- `npx netlify dev` working locally — it runs both Gatsby (port 8000) and the Netlify functions (port 9999) together. Alternative: `npx netlify functions:serve` + `npx gatsby develop`.
- Supabase access to the project's `Variants`, `ItemSizes`, and `ItemAddOns` tables (only needed to spot-check writes — the function does the actual write).
- The existing `/dashboard` password from `NETLIFY_PASSWORD`.

## File Structure

```
docs/superpowers/specs/2026-05-16-menu-price-editor-design.md   (already exists)
docs/superpowers/plans/2026-05-16-menu-price-editor.md          (this file)

netlify/functions/update-prices.ts                  CREATE   auth + validate + Supabase writes + build hook
src/components/dashboard/StatusBanner.jsx           CREATE   fixed banner with 5 visual states
src/components/dashboard/ConfirmModal.jsx           CREATE   generic confirm dialog (Discard + Update)
src/components/dashboard/MenuPriceRow.jsx           CREATE   one editable price row (dollars text input + validation)
src/components/dashboard/MenuPrices.jsx             CREATE   main editor: fetch, state, orchestration
src/components/dashboard/menuPrices.scss            CREATE   styles for tabs, banner, rows, sticky section headers

src/templates/dashboard.jsx                         MODIFY   add Orders/Menu Prices tab switcher
```

No new dependencies. `currency.js` is already in `package.json`.

---

## Task 1: Create the `update-prices` Netlify function

**Files:**
- Create: `netlify/functions/update-prices.ts`

This task lays the server contract first so the UI in later tasks has something concrete to call.

- [ ] **Step 1: Create the function file**

Create `netlify/functions/update-prices.ts` with the following contents:

```ts
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
```

- [ ] **Step 2: Smoke-test the function locally — happy path**

Start the functions server in one terminal:

```bash
npx netlify functions:serve
```

In another terminal, pick a real `Variants.id` from Supabase (look at any row — for example, `id=1`). Capture the current `base_price` so you can restore it after this test. Then run:

```bash
curl -s -X POST http://localhost:9999/.netlify/functions/update-prices \
  -H "Content-Type: application/json" \
  -d '{"password":"YOUR_NETLIFY_PASSWORD","variants":{"1":1234}}'
```

Expected output:
```
{"ok":true,"updated":1}
```

Verify the row in Supabase now shows `base_price = 1234`. Verify a fresh deploy is queued on the Netlify dashboard (`Deploys` tab — title is "triggered by price update").

Restore the row to its original value (e.g. `1550`) via another curl call so the menu is not left mutated.

- [ ] **Step 3: Smoke-test the function — rejection paths**

Each of these should produce the indicated response without writing to Supabase:

```bash
# Wrong password → 401
curl -s -o /dev/stderr -w "\n%{http_code}\n" -X POST http://localhost:9999/.netlify/functions/update-prices \
  -H "Content-Type: application/json" \
  -d '{"password":"WRONG","variants":{"1":1234}}'
# Expected: 401, body {"ok":false,"error":"Unauthorized"}

# Empty payload → 400
curl -s -o /dev/stderr -w "\n%{http_code}\n" -X POST http://localhost:9999/.netlify/functions/update-prices \
  -H "Content-Type: application/json" \
  -d '{"password":"YOUR_NETLIFY_PASSWORD"}'
# Expected: 400, body {"ok":false,"error":"No changes"}

# Negative price → 400
curl -s -o /dev/stderr -w "\n%{http_code}\n" -X POST http://localhost:9999/.netlify/functions/update-prices \
  -H "Content-Type: application/json" \
  -d '{"password":"YOUR_NETLIFY_PASSWORD","variants":{"1":-5}}'
# Expected: 400, body {"ok":false,"error":"Invalid price payload"}

# Price too large → 400
curl -s -o /dev/stderr -w "\n%{http_code}\n" -X POST http://localhost:9999/.netlify/functions/update-prices \
  -H "Content-Type: application/json" \
  -d '{"password":"YOUR_NETLIFY_PASSWORD","variants":{"1":100000}}'
# Expected: 400, body {"ok":false,"error":"Invalid price payload"}
```

- [ ] **Step 4: Commit**

```bash
git add netlify/functions/update-prices.ts
git commit -m "Add update-prices Netlify function for menu price editor"
```

---

## Task 2: Create the `StatusBanner` component

**Files:**
- Create: `src/components/dashboard/StatusBanner.jsx`

Simple presentational component, no state. Owned by `MenuPrices.jsx` (Task 5).

- [ ] **Step 1: Create the component**

Create `src/components/dashboard/StatusBanner.jsx`:

```jsx
import React from "react";

const STATE_STYLES = {
  edits: { background: "#fff8c5", color: "#5a4a00", border: "1px solid #d4ac0d" },
  saving: { background: "#cce5ff", color: "#003c8f", border: "1px solid #2962ff" },
  done: { background: "#d4f4dd", color: "#0b6b2a", border: "1px solid #2e7d32" },
  error: { background: "#fde2e1", color: "#7f1d1d", border: "1px solid #c62828" },
};

export default function StatusBanner({ state, message, onDismiss, onRetry }) {
  if (state === "idle") return null;

  const style = {
    ...STATE_STYLES[state],
    padding: "16px 20px",
    borderRadius: 6,
    margin: "16px 0",
    fontSize: "1.15rem",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 16,
  };

  return (
    <div role="status" aria-live="polite" style={style} className={`menu-prices-banner banner-${state}`}>
      <span>{message}</span>
      <span style={{ display: "flex", gap: 8 }}>
        {state === "error" && onRetry && (
          <button className="default-button" onClick={onRetry}>Try again</button>
        )}
        {state === "done" && onDismiss && (
          <button className="default-button" onClick={onDismiss}>Dismiss</button>
        )}
      </span>
    </div>
  );
}
```

- [ ] **Step 2: Verify it compiles**

Run `npx gatsby develop` (or check the existing terminal if already running). Confirm there are no compile errors mentioning `StatusBanner.jsx`. The component is not yet imported anywhere, so there is no visual change to verify.

- [ ] **Step 3: Commit**

```bash
git add src/components/dashboard/StatusBanner.jsx
git commit -m "Add StatusBanner component for menu price editor"
```

---

## Task 3: Create the `ConfirmModal` component

**Files:**
- Create: `src/components/dashboard/ConfirmModal.jsx`

Generic confirm dialog used by both the Discard flow and the Update flow. Reuses the existing `.modal` / `.modal .content` / `.default-button` styles from `src/templates/dashboard.scss`.

- [ ] **Step 1: Create the component**

Create `src/components/dashboard/ConfirmModal.jsx`:

```jsx
import React from "react";

export default function ConfirmModal({
  open,
  title,
  body,
  confirmLabel,
  cancelLabel = "Cancel",
  confirmStyle = "primary",
  onConfirm,
  onCancel,
}) {
  if (!open) return null;

  const confirmStyles =
    confirmStyle === "danger"
      ? { borderColor: "#c62828", color: "#c62828" }
      : {};

  return (
    <div className="modal" style={{ display: "block" }} role="dialog" aria-modal="true">
      <div className="content" style={{ maxWidth: 600 }}>
        <h1 style={{ marginTop: 0 }}>{title}</h1>
        <div style={{ fontSize: "1.15rem", lineHeight: 1.5 }}>{body}</div>
        <div className="actions" style={{ marginTop: 32, gap: 16 }}>
          <button className="default-button" onClick={onCancel}>
            <b>{cancelLabel}</b>
          </button>
          <button className="default-button" style={confirmStyles} onClick={onConfirm}>
            <b>{confirmLabel}</b>
          </button>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify it compiles**

Run (or check) `npx gatsby develop`. No errors should mention `ConfirmModal.jsx`.

- [ ] **Step 3: Commit**

```bash
git add src/components/dashboard/ConfirmModal.jsx
git commit -m "Add ConfirmModal component for menu price editor"
```

---

## Task 4: Create the `MenuPriceRow` component

**Files:**
- Create: `src/components/dashboard/MenuPriceRow.jsx`

Renders one editable price row (used for variants, size deltas, and item-add-ons). Owns its own text-input string state but escalates parsed cents (or `null` for invalid) to the parent via `onChange`. The parent decides whether to write into `pendingEdits`.

The input is `type="text"` with `inputMode="decimal"` — gives the mobile decimal keypad without the desktop spinner buttons that confuse older users.

- [ ] **Step 1: Create the component**

Create `src/components/dashboard/MenuPriceRow.jsx`:

```jsx
import React, { useState, useEffect } from "react";
import currency from "currency.js";
import { toPrice } from "../utilities";

const MIN_CENTS = 1;
const MAX_CENTS = 99999;
const VALID_RE = /^\$?\s*\d{0,3}(\.\d{0,2})?$/;

const centsToInputString = (cents) =>
  currency(cents, { fromCents: true }).format({ symbol: "" });

const parseInputToCents = (raw) => {
  const trimmed = String(raw).trim();
  if (trimmed === "" || !VALID_RE.test(trimmed)) return null;
  const cents = currency(trimmed).intValue;
  if (!Number.isInteger(cents) || cents < MIN_CENTS || cents > MAX_CENTS) return null;
  return cents;
};

export default function MenuPriceRow({ label, sublabel, currentCents, draftCents, onChange }) {
  const [raw, setRaw] = useState(centsToInputString(draftCents ?? currentCents));
  const [touched, setTouched] = useState(false);

  // Reset the visible input ONLY when the parent has explicitly cleared this
  // row from pendingEdits (e.g. Discard or successful publish). When draftCents
  // is null, the row is in an "invalid input" state — keep what the user typed.
  useEffect(() => {
    if (draftCents === undefined) {
      setRaw(centsToInputString(currentCents));
      setTouched(false);
    }
  }, [draftCents, currentCents]);

  const parsed = parseInputToCents(raw);
  const isInvalid = touched && parsed === null;
  const isChanged = parsed !== null && parsed !== currentCents;

  const handleChange = (e) => {
    const value = e.target.value;
    setRaw(value);
    setTouched(true);
    const next = parseInputToCents(value);
    onChange(next, next !== null && next !== currentCents);
  };

  const handleBlur = () => {
    if (parsed !== null) {
      setRaw(centsToInputString(parsed));
    }
  };

  const rowStyle = {
    display: "flex",
    alignItems: "center",
    gap: 16,
    padding: "12px 16px",
    borderLeft: `4px solid ${isChanged ? "#d4ac0d" : "transparent"}`,
    background: isChanged ? "#fffbe6" : "transparent",
    borderRadius: 4,
  };

  const inputStyle = {
    fontSize: "1.25rem",
    padding: "8px 10px",
    width: 110,
    border: `2px solid ${isInvalid ? "#c62828" : "#999"}`,
    borderRadius: 4,
  };

  return (
    <div className="menu-price-row" style={rowStyle}>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: "1.15rem", fontWeight: 600 }}>{label}</div>
        {sublabel && <div style={{ fontSize: "0.95rem", color: "#666" }}>{sublabel}</div>}
      </div>
      <div style={{ color: "#666", minWidth: 110, textAlign: "right" }}>
        Current: {toPrice(currentCents)}
      </div>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
        <label style={{ fontSize: "0.9rem", color: "#666" }}>New</label>
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <span style={{ fontSize: "1.25rem" }}>$</span>
          <input
            type="text"
            inputMode="decimal"
            value={raw}
            onChange={handleChange}
            onBlur={handleBlur}
            style={inputStyle}
            aria-invalid={isInvalid}
          />
        </div>
        {isInvalid && (
          <div style={{ color: "#c62828", fontSize: "0.85rem", marginTop: 4 }}>
            Enter a price between $0.01 and $999.99
          </div>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify it compiles**

Check the `gatsby develop` output. No errors mentioning `MenuPriceRow.jsx`.

- [ ] **Step 3: Commit**

```bash
git add src/components/dashboard/MenuPriceRow.jsx
git commit -m "Add MenuPriceRow component for menu price editor"
```

---

## Task 5: Create the `MenuPrices` container component

**Files:**
- Create: `src/components/dashboard/MenuPrices.jsx`

The orchestrator. Fetches the menu via `/.netlify/functions/gsheets`, manages `pendingEdits`, registers the `beforeunload` guard, shows the banner, opens the confirm modals, and calls `/.netlify/functions/update-prices` on confirm.

- [ ] **Step 1: Create the component**

Create `src/components/dashboard/MenuPrices.jsx`:

```jsx
import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { BASE_URL, toPrice } from "../utilities";
import MenuPriceRow from "./MenuPriceRow";
import ConfirmModal from "./ConfirmModal";
import StatusBanner from "./StatusBanner";

// pendingEdits stores ALL touched rows. Value is the parsed cents, or null if the
// row's current input is invalid (so the row is "dirty but unpublishable"). A row
// that reverts back to currentCents is removed from the map entirely.
const EMPTY_EDITS = { variants: {}, itemSizes: {}, itemAddOns: {} };

const allEntries = (edits) => [
  ...Object.values(edits.variants),
  ...Object.values(edits.itemSizes),
  ...Object.values(edits.itemAddOns),
];

const countValid = (edits) =>
  allEntries(edits).filter((v) => v !== null).length;

const countInvalid = (edits) =>
  allEntries(edits).filter((v) => v === null).length;

const countDirty = (edits) => allEntries(edits).length;

// Strip out null (invalid) entries before sending to the server.
const validPayload = (edits) => ({
  variants: Object.fromEntries(Object.entries(edits.variants).filter(([, v]) => v !== null)),
  itemSizes: Object.fromEntries(Object.entries(edits.itemSizes).filter(([, v]) => v !== null)),
  itemAddOns: Object.fromEntries(Object.entries(edits.itemAddOns).filter(([, v]) => v !== null)),
});

export default function MenuPrices({ password }) {
  const [menu, setMenu] = useState(null);
  const [loadError, setLoadError] = useState(null);
  const [pendingEdits, setPendingEdits] = useState(EMPTY_EDITS);
  const [bannerState, setBannerState] = useState("idle");
  const [bannerMessage, setBannerMessage] = useState("");
  const [confirmKind, setConfirmKind] = useState(null);

  // Fetch the menu on mount.
  useEffect(() => {
    let active = true;
    axios
      .get(`${BASE_URL}/.netlify/functions/gsheets`)
      .then((res) => {
        if (active) setMenu(res.data);
      })
      .catch((err) => {
        if (active) setLoadError(err?.message || "Failed to load menu");
      });
    return () => {
      active = false;
    };
  }, []);

  const validCount = countValid(pendingEdits);
  const invalidCount = countInvalid(pendingEdits);
  const dirtyCount = countDirty(pendingEdits);

  // beforeunload guard whenever there are ANY touched rows (valid or invalid).
  useEffect(() => {
    if (dirtyCount === 0) return undefined;
    const handler = (e) => {
      e.preventDefault();
      e.returnValue = "";
      return "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirtyCount]);

  // Banner derived from edit state when not in an explicit lifecycle state.
  useEffect(() => {
    if (bannerState === "saving" || bannerState === "done" || bannerState === "error") return;
    if (dirtyCount > 0) {
      setBannerState("edits");
      setBannerMessage(
        `You have ${dirtyCount} unsaved change${dirtyCount === 1 ? "" : "s"}. Click 'Update Prices on Website' when you're ready.`
      );
    } else {
      setBannerState("idle");
      setBannerMessage("");
    }
  }, [dirtyCount, bannerState]);

  // Called by every MenuPriceRow on every keystroke.
  //  - cents === null   → input is invalid (track row as dirty, but not publishable)
  //  - isChanged false  → user typed back to currentCents → drop the entry
  //  - otherwise        → record the new cents value
  const handleRowChange = (kind, id, cents, isChanged) => {
    setPendingEdits((prev) => {
      const next = { ...prev, [kind]: { ...prev[kind] } };
      if (cents !== null && !isChanged) {
        delete next[kind][id];
      } else {
        next[kind][id] = cents;
      }
      return next;
    });
  };

  const handleDiscard = () => setConfirmKind("discard");
  const handleUpdate = () => setConfirmKind("update");
  const closeConfirm = () => setConfirmKind(null);

  const doDiscard = () => {
    setPendingEdits(EMPTY_EDITS);
    setBannerState("idle");
    setBannerMessage("");
    setConfirmKind(null);
  };

  const doUpdate = async () => {
    setConfirmKind(null);
    setBannerState("saving");
    setBannerMessage("Saving... please wait. Do not close this window.");
    try {
      const res = await axios.post(`${BASE_URL}/.netlify/functions/update-prices`, {
        password,
        ...validPayload(pendingEdits),
      });
      if (res.data?.ok) {
        setPendingEdits(EMPTY_EDITS);
        setBannerState("done");
        setBannerMessage(
          "Done! Prices will update on the website in about 2 minutes."
        );
      } else {
        setBannerState("error");
        setBannerMessage(
          res.data?.buildHookFailed
            ? "Your prices were saved but the website did not start updating. Contact the developer."
            : res.data?.partiallyApplied
              ? "Something went wrong. Some prices may have updated. Click 'Try again' to finish."
              : "Something went wrong. Your changes are still here."
        );
      }
    } catch (err) {
      const data = err?.response?.data;
      setBannerState("error");
      setBannerMessage(
        data?.buildHookFailed
          ? "Your prices were saved but the website did not start updating. Contact the developer."
          : data?.partiallyApplied
            ? "Something went wrong. Some prices may have updated. Click 'Try again' to finish."
            : "Something went wrong. Your changes are still here."
      );
    }
  };

  const dismissDone = () => {
    setBannerState("idle");
    setBannerMessage("");
  };

  const summary = useMemo(() => buildSummary(menu, pendingEdits), [menu, pendingEdits]);

  if (loadError) {
    return <div style={{ padding: 24, color: "#c62828" }}>Could not load the menu: {loadError}</div>;
  }
  if (!menu) {
    return <div style={{ padding: 24 }}>Loading menu...</div>;
  }

  const sections = Object.values(menu.sectionKeys || {});
  const updateDisabled = validCount === 0 || invalidCount > 0;

  return (
    <div className="menu-prices">
      <StatusBanner
        state={bannerState}
        message={bannerMessage}
        onDismiss={dismissDone}
        onRetry={doUpdate}
      />

      {sections.map((section) => (
        <div key={section.id} className="menu-prices-section">
          <h2 className="menu-prices-section-header">{section.title}</h2>
          {(section.Items || []).map((item) => (
            <div key={item.id} className="menu-prices-item">
              <h3 className="menu-prices-item-title">{item.title}</h3>

              {(item.Variants || []).map((variant) => (
                <MenuPriceRow
                  key={`variant-${variant.id}`}
                  label={variant.title || item.title}
                  sublabel="Base price"
                  currentCents={variant.base_price}
                  draftCents={pendingEdits.variants[variant.id]}
                  onChange={(cents, changed) =>
                    handleRowChange("variants", variant.id, cents, changed)
                  }
                />
              ))}

              {(item.ItemSizes || [])
                .filter((is) => is.add_price !== null && is.add_price !== 0)
                .map((itemSize) => (
                  <MenuPriceRow
                    key={`itemSize-${itemSize.id}`}
                    label={`${itemSize.Sizes?.title ?? "Size"} add-on`}
                    sublabel="Added to the base price"
                    currentCents={itemSize.add_price}
                    draftCents={pendingEdits.itemSizes[itemSize.id]}
                    onChange={(cents, changed) =>
                      handleRowChange("itemSizes", itemSize.id, cents, changed)
                    }
                  />
                ))}

              {(item.ItemAddOns || []).map((itemAddOn) => (
                <MenuPriceRow
                  key={`itemAddOn-${itemAddOn.id}`}
                  label={`${itemAddOn.AddOns?.title ?? "Add-on"}`}
                  sublabel="Optional add-on price"
                  currentCents={itemAddOn.add_price}
                  draftCents={pendingEdits.itemAddOns[itemAddOn.id]}
                  onChange={(cents, changed) =>
                    handleRowChange("itemAddOns", itemAddOn.id, cents, changed)
                  }
                />
              ))}
            </div>
          ))}
        </div>
      ))}

      <div className="menu-prices-actions">
        <button
          className="default-button"
          onClick={handleDiscard}
          disabled={dirtyCount === 0}
          style={{ borderColor: "#c62828", color: "#c62828" }}
        >
          <b>Discard Changes</b>
        </button>
        <button
          className="default-button"
          onClick={handleUpdate}
          disabled={updateDisabled}
        >
          <b>Update Prices on Website</b>
        </button>
      </div>

      <ConfirmModal
        open={confirmKind === "discard"}
        title="Throw away your changes?"
        body={<p>This cannot be undone. You will lose {dirtyCount} unsaved change{dirtyCount === 1 ? "" : "s"}.</p>}
        confirmLabel="Throw away changes"
        cancelLabel="Keep editing"
        confirmStyle="danger"
        onConfirm={doDiscard}
        onCancel={closeConfirm}
      />

      <ConfirmModal
        open={confirmKind === "update"}
        title={`You are about to update ${validCount} price${validCount === 1 ? "" : "s"} on the website:`}
        body={
          <>
            <ul style={{ paddingLeft: 20 }}>
              {summary.map((line, i) => (
                <li key={i} style={{ marginBottom: 8 }}>
                  <b>{line.label}</b>
                  <br />
                  <span>
                    {line.kind}: {toPrice(line.from)} &rarr; {toPrice(line.to)}
                  </span>
                </li>
              ))}
            </ul>
            <p style={{ marginTop: 16 }}>
              The website will show the new prices in about 2 minutes.
            </p>
          </>
        }
        confirmLabel="Yes, update the website"
        cancelLabel="Cancel"
        onConfirm={doUpdate}
        onCancel={closeConfirm}
      />
    </div>
  );
}

function buildSummary(menu, pendingEdits) {
  if (!menu) return [];
  const out = [];
  const sections = Object.values(menu.sectionKeys || {});
  for (const section of sections) {
    for (const item of section.Items || []) {
      for (const variant of item.Variants || []) {
        const v = pendingEdits.variants[variant.id];
        if (v !== undefined && v !== null) {
          out.push({
            label: `${item.title} — ${variant.title || item.title}`,
            kind: "Base price",
            from: variant.base_price,
            to: v,
          });
        }
      }
      for (const itemSize of item.ItemSizes || []) {
        const v = pendingEdits.itemSizes[itemSize.id];
        if (v !== undefined && v !== null) {
          out.push({
            label: `${item.title} — ${itemSize.Sizes?.title ?? "Size"}`,
            kind: "Size add-on price",
            from: itemSize.add_price,
            to: v,
          });
        }
      }
      for (const itemAddOn of item.ItemAddOns || []) {
        const v = pendingEdits.itemAddOns[itemAddOn.id];
        if (v !== undefined && v !== null) {
          out.push({
            label: `${item.title} — ${itemAddOn.AddOns?.title ?? "Add-on"}`,
            kind: "Add-on price",
            from: itemAddOn.add_price,
            to: v,
          });
        }
      }
    }
  }
  return out;
}
```

The data model: `pendingEdits[kind][id]` can be a cents integer (valid edit), or `null` (the user touched the row but the current input is invalid). A row reverted to `currentCents` is removed from the map entirely. The three derived counts:
- `validCount` — entries with a real number → drives the green Update button.
- `invalidCount` — entries with `null` → if > 0, the Update button is disabled.
- `dirtyCount` — total entries → drives the `beforeunload` guard, the yellow banner, and the Discard button.

- [ ] **Step 2: Verify it compiles**

Check `gatsby develop` output. No errors should reference `MenuPrices.jsx`.

- [ ] **Step 3: Commit**

```bash
git add src/components/dashboard/MenuPrices.jsx
git commit -m "Add MenuPrices container component"
```

---

## Task 6: Add styles for the price editor

**Files:**
- Create: `src/components/dashboard/menuPrices.scss`

Styles for the new tab-switcher, sticky section headers, item grouping, and the action bar. Modal and button styles are reused from `src/templates/dashboard.scss` via the shared `.modal` and `.default-button` classes.

- [ ] **Step 1: Create the stylesheet**

Create `src/components/dashboard/menuPrices.scss`:

```scss
.dashboard-tabs {
  display: flex;
  gap: 8px;
  margin: 16px 24px 0 24px;
  border-bottom: 2px solid #ddd;

  button {
    background: white;
    border: none;
    padding: 12px 24px;
    font-size: 1.1rem;
    cursor: pointer;
    border-bottom: 4px solid transparent;
    color: #666;

    &.active {
      color: #009b58;
      border-bottom-color: #009b58;
      font-weight: 700;
    }

    &:hover:not(.active) {
      color: #009b58;
    }
  }
}

.menu-prices {
  padding: 0 24px 96px;
  max-width: 900px;
  margin: 0 auto;
}

.menu-prices-section {
  margin-top: 32px;
}

.menu-prices-section-header {
  position: sticky;
  top: 0;
  background: white;
  z-index: 2;
  margin: 0;
  padding: 12px 0;
  border-bottom: 2px solid #ddd;
  font-size: 1.5rem;
}

.menu-prices-item {
  border-bottom: 1px solid #eee;
  padding: 12px 0;
}

.menu-prices-item-title {
  margin: 8px 0;
  font-size: 1.15rem;
  color: #333;
}

.menu-prices-actions {
  position: sticky;
  bottom: 0;
  background: white;
  border-top: 1px solid #ddd;
  padding: 16px 0;
  margin-top: 32px;
  display: flex;
  gap: 16px;
  justify-content: space-between;

  button[disabled] {
    opacity: 0.5;
    cursor: not-allowed;
  }
}
```

- [ ] **Step 2: Verify it compiles**

Check `gatsby develop` output. The file will not be imported until Task 7, so there is no visual change to verify.

- [ ] **Step 3: Commit**

```bash
git add src/components/dashboard/menuPrices.scss
git commit -m "Add styles for menu price editor"
```

---

## Task 7: Wire the Menu Prices tab into `/dashboard`

**Files:**
- Modify: `src/templates/dashboard.jsx`

Add a two-tab switcher above the existing orders view. The Menu Prices tab mounts the new `MenuPrices` component and is only rendered when active.

- [ ] **Step 1: Add imports near the top of `dashboard.jsx`**

Open `src/templates/dashboard.jsx`. Below the existing import line `import Order from "../components/dashboard/Order"`, add:

```jsx
import MenuPrices from "../components/dashboard/MenuPrices"
import "../components/dashboard/menuPrices.scss"
```

- [ ] **Step 2: Add tab state next to the existing `useState` calls**

Inside the `DashboardPage` component, immediately after `const [isOpen, setIsOpen] = useState(open);` add:

```jsx
const [activeTab, setActiveTab] = useState("orders");
```

- [ ] **Step 3: Render the tab switcher and conditional view**

Replace the current returned JSX after authentication (the `return ( <div> <div> ... )` block) with this structure — keep all existing internals for the orders view, but wrap them in a conditional and add the tab bar above:

```jsx
return (
  <div>
    <div className="dashboard-tabs">
      <button
        className={activeTab === "orders" ? "active" : ""}
        onClick={() => setActiveTab("orders")}
      >
        Orders
      </button>
      <button
        className={activeTab === "prices" ? "active" : ""}
        onClick={() => setActiveTab("prices")}
      >
        Menu Prices
      </button>
    </div>

    {activeTab === "orders" && (
      <div>
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", flexDirection: "column" }}>
          <p>WEBSITE IS <b className={`store-status-${isOpen ? "open" : "closed"}`}>{isOpen ? "OPEN" : "CLOSED"}</b></p>
          <button className="default-button test-button" onClick={toggleModal}>Settings</button>
        </div>
        {
          orders.length === 0 ?
            <p className="noOrders">No orders.</p> :
            <ul style={{ listStyleType: "none", padding: 0 }}>
              {
                orders.slice(0, 100).map(order =>
                  <li key={order.id}>
                    <Order {...order} />
                  </li>
                )}
            </ul>
        }
        <div ref={introModalRef} className="modal-initial-open modal">
          <div className="content" style={{ maxWidth: 500 }}>
            <h1>Turn On Sound</h1>
            <p>Please turn on sound so you can receive alerts with new orders by clicking <b>OK</b>.</p>
            <button className="default-button" onClick={handleClick}><b>OK</b></button>
          </div>
        </div>
        <div ref={settingsModalRef} className="modal-initial-closed modal">
          <div className="content">
            <div className="header-bar">
              <h1>Settings</h1>
              <button className="default-button" style={{ margin: 0 }} onClick={toggleModal}>Exit</button>
            </div>
            <div className="actions">
              {
                isOpen ?
                  <button className="default-button" onClick={toggleStoreOpening}><b>Close Orders</b></button> :
                  <button className="default-button" onClick={toggleStoreOpening}><b>Open Orders</b></button>
              }
              <button className="default-button" onClick={playNotification}><b>Test Sound</b></button>
              <button className="default-button" onClick={rebuildWebsite}><b>Rebuild Website</b></button>
            </div>
          </div>
        </div>
      </div>
    )}

    {activeTab === "prices" && (
      <MenuPrices password={passwordInput} />
    )}
  </div>
);
```

Notes:
- `passwordInput` is the existing state variable holding what the user typed at the password gate. We pass it down so `MenuPrices` can include it in the `POST /update-prices` body. The user already typed it once at login; no need to ask again.
- The polling loop and `useInterval` that fetches orders runs regardless of which tab is active — that is fine and matches the existing behavior (orders stay fresh in the background).

- [ ] **Step 4: Verify the tab switcher renders**

Run `npx netlify dev` (or `gatsby develop` + `netlify functions:serve` in two terminals). Open `http://localhost:9999/dashboard` (or :8000 if running Gatsby standalone), enter the password, and confirm:

- The two tabs **Orders** / **Menu Prices** show at the top.
- Orders is active by default and the existing orders view renders below.
- Clicking **Menu Prices** swaps to the editor view; clicking back to **Orders** restores the orders view.

- [ ] **Step 5: Commit**

```bash
git add src/templates/dashboard.jsx
git commit -m "Add Menu Prices tab to dashboard"
```

---

## Task 8: End-to-end smoke test

**Files:** None (manual verification only)

Walk through every flow from the spec's "Testing" section. The point is to catch integration bugs that the per-task verifications missed.

- [ ] **Step 1: Setup**

Start the dev environment:

```bash
npx netlify dev
```

Note the current `base_price` of two variants and the `add_price` of one `ItemSizes` and one `ItemAddOns` row in Supabase. You will restore these at the end.

Open `http://localhost:9999/dashboard`, enter the password, and click **Menu Prices**.

- [ ] **Step 2: Happy path — three-table edit and publish**

Edit three prices, one from each table:

1. Change a variant's base price by some amount (e.g. up 50¢).
2. Change a size add-on price (find an item with a "Large" size showing).
3. Change an item add-on price (e.g. "Extra Meat").

Verify:
- Yellow banner appears: "You have 3 unsaved changes..."
- Each edited row has a yellow left border and yellow background tint.
- The **Update Prices on Website** button is enabled, **Discard Changes** is enabled.

Click **Update Prices on Website**. Verify:
- The confirm modal lists exactly three changes with correct labels and `$X.YY → $Z.ZZ` formatting.
- The "2 minutes" footnote shows.

Click **Yes, update the website**. Verify:
- Banner turns blue: "Saving... please wait..."
- Then turns green: "Done! Prices will update on the website in about 2 minutes."
- Yellow tints clear, edit indicators gone.
- In Supabase, the three rows show the new values.
- In the Netlify dashboard, a new deploy is queued with title "triggered by price update".

- [ ] **Step 3: Reload behavior**

Edit one price. Reload the page (Cmd-R). Verify:
- The browser shows the native "Leave Site? Changes you made may not be saved." dialog.
- Cancel: stay on page, edit retained.
- Reload again, this time confirm: page reloads with no edits restored, no banner.

- [ ] **Step 4: Discard flow**

Edit two prices. Click **Discard Changes**. Verify:
- Confirm modal: "Throw away your changes?" with "2 unsaved changes" text.
- Click **Keep editing**: modal closes, edits intact.
- Click **Discard Changes** again, then **Throw away changes**: edits clear, banner returns to idle.

- [ ] **Step 5: Invalid input**

In one row, type each of the following and confirm the behavior:

- `-1` → red helper text "Enter a price between $0.01 and $999.99", Update button disabled.
- `0` → same (zero is invalid; min is 1 cent).
- `1000.00` → same (exceeds $999.99).
- `abc` → same.
- Clear the field → same.

Type a valid value (e.g. `15.00`). Update button becomes enabled.

- [ ] **Step 6: Error path**

Stop the functions server (Ctrl-C the `netlify dev` terminal). Restart it but temporarily rename `SUPABASE_PRIVATE_KEY` in `.env.development` to `SUPABASE_PRIVATE_KEY_BROKEN`. Restart.

Edit one price, click **Update Prices on Website**, confirm. Verify:
- The function throws on startup (no Supabase creds), the request fails.
- Banner turns red with appropriate error text.
- Edits remain in place.
- **Try again** button appears in the banner.

Restore the env var name and restart. Click **Try again**. Verify the update succeeds and the green "Done!" banner appears.

- [ ] **Step 7: Restore data**

Restore each variant / itemSize / itemAddOn modified during this smoke test back to its original price (either via the editor itself or directly in Supabase).

- [ ] **Step 8: No commit**

This task is verification-only — no code changes.

---

## Self-review notes (engineer reading this plan)

- The price input uses a regex-validated text field, not an `<input type="number">`. Older users find the spinner buttons confusing, and `type="number"` browsers each apply their own quirky validation that gets in the way.
- Prices are stored in cents end-to-end. The only place we convert is the input rendering (cents → dollar string) and parsing (dollar string → cents via `currency.js`). Do not introduce floating-point arithmetic anywhere.
- `pendingEdits` is in-memory only by design (the spec explicitly rules out drafts). The `beforeunload` listener is the only safety net.
- The function never wraps writes in a transaction (Supabase JS does not expose one easily). Retries are safe because each write sends the absolute target value, not a diff. If a partial-failure occurs, the user clicks "Try again" and the same payload is replayed.
- The build hook only fires after all writes succeed. Do not move that call earlier.
- We pass the password from `dashboard.jsx` down to `MenuPrices.jsx` via prop, reusing what the user already typed at the password gate. Do not prompt for a second password.
