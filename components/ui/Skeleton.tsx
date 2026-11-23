"use client";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "text" | "circular" | "rectangular" | "card";
  width?: string | number;
  height?: string | number;
  lines?: number;
}

export function Skeleton({ variant = "rectangular", width, height, lines = 3, className = "", ...props }: SkeletonProps) {
  const baseStyles = "animate-pulse bg-[var(--color-skeleton)] rounded";

  if (variant === "text") {
    return (
      <div className={className} {...props}>
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className={`${baseStyles} h-4 w-full ${i === lines - 1 && width ? `w-[${width}]` : ""} ${i === lines - 1 ? "w-3/4" : ""}`}
            style={{ width: i === lines - 1 && typeof width === "number" ? `${width}px` : undefined }}
          />
        ))}
      </div>
    );
  }

  if (variant === "circular") {
    return (
      <div
        className={`${baseStyles} rounded-full ${className}`}
        style={{ width: width || 40, height: height || 40 }}
        {...props}
      />
    );
  }

  if (variant === "card") {
    return (
      <div className="space-y-4 p-4 bg-white border border-[var(--color-border)] rounded-xl ${className}" {...props}>
        <div className="flex items-center gap-4">
          <div className={`${baseStyles} rounded-full`} style={{ width: 40, height: 40 }} />
          <div className="flex-1 space-y-2">
            <div className={`${baseStyles} h-4 w-3/4`} />
            <div className={`${baseStyles} h-3 w-1/2`} />
          </div>
        </div>
        <div className={`${baseStyles} h-12`} />
        <div className="grid gap-2 sm:grid-cols-2">
          <div className={`${baseStyles} h-20 rounded-lg`} />
          <div className={`${baseStyles} h-20 rounded-lg`} />
        </div>
      </div>
    );
  }

  return (
    <div
      className={`${baseStyles} ${className}`}
      style={{ width, height: height || 16 }}
      {...props}
    />
  );
}

export function TableSkeleton({ rows = 5, columns = 4 }: { rows?: number; columns?: number }) {
  return (
    <div className="bg-white border border-[var(--color-border)] rounded-xl overflow-hidden">
      <div className="bg-[var(--color-background)] border-b border-[var(--color-border)]">
        <div className="grid gap-4 p-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
          {Array.from({ length: columns }).map((_, i) => (
            <div key={i} className="animate-pulse bg-[var(--color-skeleton)] h-4 w-3/4 rounded" />
          ))}
        </div>
      </div>
      <div className="divide-y divide-[var(--color-border)]">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={rowIndex} className="p-4">
            <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
              {Array.from({ length: columns }).map((_, colIndex) => (
                <div key={colIndex} className="animate-pulse bg-[var(--color-skeleton)] h-5 w-full rounded" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function CardGridSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} variant="card" />
      ))}
    </div>
  );
}