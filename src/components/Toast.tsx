type ToastProps = {
  open: boolean;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  onClose: () => void;
};

export default function Toast({ open, message, actionLabel, onAction, onClose }: ToastProps) {
  if (!open) {
    return null;
  }

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-5 z-50 flex justify-center px-4">
      <div className="pointer-events-auto flex w-full max-w-sm items-center justify-between rounded-2xl bg-slate-900 px-4 py-3 text-sm text-white shadow-xl animate-toast-in">
        <span className="mr-3 truncate text-slate-100">{message}</span>
        <div className="flex items-center gap-3">
          {actionLabel && onAction ? (
            <button type="button" onClick={onAction} className="font-medium text-sky-300">
              {actionLabel}
            </button>
          ) : null}
          <button type="button" onClick={onClose} className="text-slate-400">
            ✕
          </button>
        </div>
      </div>
    </div>
  );
}
