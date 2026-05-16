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
