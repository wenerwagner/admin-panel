import type { ReactNode } from "react";

type ConfirmDialogProps = {
  cancelLabel?: string;
  confirmLabel: string;
  children: ReactNode;
  isConfirming?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  title: string;
  variant?: "danger";
};

export function ConfirmDialog({
  cancelLabel = "Cancel",
  confirmLabel,
  children,
  isConfirming = false,
  onCancel,
  onConfirm,
  title,
  variant,
}: ConfirmDialogProps) {
  return (
    <div className="dialog-backdrop" role="presentation">
      <section className="confirm-dialog" role="dialog" aria-modal="true" aria-labelledby="confirm-dialog-title">
        <h2 id="confirm-dialog-title">{title}</h2>
        <div className="dialog-body">{children}</div>
        <div className="dialog-actions">
          <button className="secondary-button" type="button" onClick={onCancel} disabled={isConfirming}>
            {cancelLabel}
          </button>
          <button
            className={variant === "danger" ? "danger-button" : "primary-button"}
            type="button"
            onClick={onConfirm}
            disabled={isConfirming}
          >
            {isConfirming ? "Deleting..." : confirmLabel}
          </button>
        </div>
      </section>
    </div>
  );
}
