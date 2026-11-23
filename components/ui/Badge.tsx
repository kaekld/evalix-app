"use client";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "success" | "warning" | "danger" | "info" | "primary";
  size?: "sm" | "md";
}

const variantStyles = {
  default: "bg-[var(--color-border)] text-[var(--color-text-primary)]",
  success: "bg-[var(--color-success-bg)] text-[var(--color-success)]",
  warning: "bg-[var(--color-warning-bg)] text-[var(--color-warning)]",
  danger: "bg-[var(--color-danger-bg)] text-[var(--color-danger)]",
  info: "bg-[var(--color-primary-light)] text-[var(--color-primary)]",
  primary: "bg-[var(--color-primary)] text-white",
};

const sizeStyles = {
  sm: "px-2 h-6 text-xs",
  md: "px-3 h-7 text-sm",
};

export function Badge({ variant = "default", size = "md", className = "", children, ...props }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center justify-center font-medium rounded-full ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
}

export interface StatusBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  status: "active" | "inactive" | "pending" | "completed" | "cancelled" | "upcoming";
  size?: "sm" | "md";
}

const statusStyles: Record<StatusBadgeProps["status"], string> = {
  active: "bg-green-100 text-green-700",
  inactive: "bg-red-100 text-red-700",
  pending: "bg-white text-[var(--color-primary)] border border-[var(--color-primary)]",
  completed: "bg-[var(--color-success-bg)] text-[var(--color-success)]",
  cancelled: "bg-[var(--color-danger-bg)] text-[var(--color-danger)]",
  upcoming: "bg-[var(--color-primary-light)] text-[var(--color-primary)]",
};

export function StatusBadge({ status, size = "md", className = "", children, ...props }: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center justify-center font-medium rounded-full ${statusStyles[status]} ${sizeStyles[size]} ${className}`}
      {...props}
    >
      {children || status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}