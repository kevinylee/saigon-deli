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

  const confirmClass = confirmStyle === "danger" ? "default-button danger" : "default-button";

  return (
    <div className="modal" style={{ display: "block" }} role="dialog" aria-modal="true">
      <div className="content" style={{ maxWidth: 600 }}>
        <h1 style={{ marginTop: 0 }}>{title}</h1>
        <div style={{ fontSize: "1.15rem", lineHeight: 1.5 }}>{body}</div>
        <div className="actions">
          <button className="default-button" onClick={onCancel}>
            <b>{cancelLabel}</b>
          </button>
          <button className={confirmClass} onClick={onConfirm}>
            <b>{confirmLabel}</b>
          </button>
        </div>
      </div>
    </div>
  );
}
