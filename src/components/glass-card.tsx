import type { HTMLAttributes, ReactNode } from "react";

type GlassCardProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
  title?: ReactNode;
  description?: string;
  actions?: ReactNode;
};

export function GlassCard({ children, title, description, actions, className = "", ...rest }: GlassCardProps) {
  const hasHeader = title != null || description != null || actions != null;

  return (
    <div className={`glass-panel p-5 md:p-8 ${className}`.trim()} {...rest}>
      {hasHeader ? (
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between md:mb-8">
          <div className="min-w-0 space-y-2">
            {title != null ? (
              <h2 className="text-lg font-semibold tracking-tight text-zinc-50 md:text-xl [&_svg]:shrink-0">
                {title}
              </h2>
            ) : null}
            {description != null ? (
              <p className="max-w-2xl text-sm leading-relaxed text-zinc-400 md:text-[15px]">{description}</p>
            ) : null}
          </div>
          {actions != null ? <div className="shrink-0">{actions}</div> : null}
        </div>
      ) : null}
      {children}
    </div>
  );
}
