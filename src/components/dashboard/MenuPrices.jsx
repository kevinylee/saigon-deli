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
          res.data?.partiallyApplied
            ? "Something went wrong. Some prices may have updated. Click 'Try again' to finish."
            : "Something went wrong. Your changes are still here."
        );
      }
    } catch (err) {
      const data = err?.response?.data;
      setBannerState("error");
      setBannerMessage(
        data?.partiallyApplied
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
          className="default-button danger"
          onClick={handleDiscard}
          disabled={dirtyCount === 0}
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
