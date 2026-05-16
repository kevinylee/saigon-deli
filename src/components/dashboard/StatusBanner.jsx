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
