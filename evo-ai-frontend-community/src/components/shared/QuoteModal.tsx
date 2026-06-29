import { ReactNode } from 'react';

type FooterAction = {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
};

type QuoteModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  status?: ReactNode;
  subtitle?: string;
  maxWidth?: string;
  children: ReactNode;
  footerActions?: FooterAction[];
};

export default function QuoteModal({
  open,
  onOpenChange,
  title,
  status,
  subtitle,
  maxWidth = 'max-w-4xl',
  children,
  footerActions = [],
}: QuoteModalProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6"
      onClick={(e) => {
        if (e.target === e.currentTarget) onOpenChange(false);
      }}
    >
      <div className={`bg-background border rounded-lg shadow-lg w-full ${maxWidth} max-h-[90vh] flex flex-col relative`}>
        <div className="flex flex-col space-y-2 text-center sm:text-left shrink-0 p-6 border-b">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <span>{title}</span>
              {status}
            </h2>
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
          {subtitle && (
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">{children}</div>

        {footerActions.length > 0 && (
          <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 shrink-0 p-6 border-t">
            {footerActions.map((action) => (
              <button
                key={action.label}
                type="button"
                onClick={action.onClick}
                disabled={action.disabled}
                className={
                  action.variant === 'primary'
                    ? 'inline-flex items-center justify-center rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4 py-2'
                    : 'inline-flex items-center justify-center rounded-md text-sm font-medium border border-input bg-background hover:bg-accent h-9 px-4 py-2 mt-2 sm:mt-0'
                }
              >
                {action.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
