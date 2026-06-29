import { type ReactNode } from 'react';

type AppModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  maxWidthClass?: string;
  children?: ReactNode;
  footer?: ReactNode;
  onClose?: () => void;
  overlayClassName?: string;
};

export default function AppModal({
  open,
  onOpenChange,
  title,
  description,
  maxWidthClass = 'max-w-lg',
  children,
  footer,
  onClose,
  overlayClassName,
}: AppModalProps) {
  if (!open) {
    return null;
  }

  const handleClose = () => {
    onOpenChange?.(false);
    onClose?.();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="app-modal-title"
      className={`fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 ${overlayClassName ?? ''}`}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) {
          handleClose();
        }
      }}
    >
      <div className={`w-full ${maxWidthClass} bg-[#0f1115] border border-white/10 rounded-lg shadow-xl flex flex-col max-h-[90vh]`}>
        <div className="flex items-start justify-between px-5 py-4 border-b border-white/5">
          <div className="min-w-0">
            <h2 id="app-modal-title" className="text-white text-lg font-semibold truncate">
              {title}
            </h2>
            {description ? (
              <p className="mt-1 text-sm text-white/60">{description}</p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="ml-4 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/5 text-white hover:bg-white/10"
            aria-label="Fechar modal"
          >
            <span className="text-white text-lg leading-none">×</span>
          </button>
        </div>

        {(children || footer) && (
          <div className="flex-1 overflow-y-auto px-5 py-4">{children}</div>
        )}

        {footer ? (
          <div className="border-t border-white/5 px-5 py-4 flex items-center justify-end gap-3 bg-black/20">
            {footer}
          </div>
        ) : null}
      </div>
    </div>
  );
}
