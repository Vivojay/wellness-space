export default function ConfirmDialog({ open, title, message, confirmLabel = "Confirm", cancelLabel = "Cancel", onConfirm, onCancel, theme }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center bg-black/40">
      <div className="w-full max-w-sm border rounded-none p-6" style={{ backgroundColor: theme.colors.bg.card, borderColor: theme.border }}>
        <h3 className="text-lg mb-3" style={{ color: theme.text }}>{title}</h3>
        <p className="text-sm mb-6" style={{ color: theme.textMuted }}>{message}</p>
        <div className="flex justify-end gap-3">
          <button
            type="button"
            className="px-4 py-2 border rounded-none text-sm"
            style={{ borderColor: theme.border, color: theme.text }}
            onClick={onCancel}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            className="px-4 py-2 border rounded-none text-sm"
            style={{ borderColor: theme.accent, backgroundColor: theme.accent, color: "#ffffff" }}
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
