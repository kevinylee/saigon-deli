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
