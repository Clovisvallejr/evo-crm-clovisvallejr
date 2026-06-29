import { type ReactNode } from 'react';

type QouteModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  maxWidthClass?: string;
  children: ReactNode;
  footer?: ReactNode;
};

export default function QouteModal({
  open,
  onOpenChange,
  title,
  description,
  maxWidthClass = 'max-w-4xl',
  children,
  footer,
}: QouteModalProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6"
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          onOpenChange(false);
        }
      }}
    >
      <div
        className={`bg-background border rounded-lg shadow-lg w-full ${maxWidthClass} max-h-[90vh] flex flex-col relative`}
      >
        <div className="flex flex-col space-y-2 text-center sm:text-left shrink-0 p-6 border-b">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">{title}</h2>
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="rounded-sm opacity-70 hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" x2="6" y1="6" y2="18" />
                <line x1="6" x2="18" y1="6" y2="18" />
              </svg>
              <span className="sr-only">Fechar</span>
            </button>
          </div>
          {description ? (
            <p className="text-sm text-muted-foreground">{description}</p>
          ) : null}
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">{children}</div>

        {footer ? (
          <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 shrink-0 p-6 border-t bg-muted/10">
            {footer}
          </div>
        ) : null}
      </div>
    </div>
  );
}
