"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface TabsContextType {
  activeTab: string;
  onTabChange: (tab: string) => void;
  variant?: "default" | "underline" | "pills";
}

const TabsContext = createContext<TabsContextType | null>(null);

function useTabsContext() {
  const context = useContext(TabsContext);
  if (!context) {
    throw new Error("Tabs components must be used within Tabs.Root");
  }
  return context;
}

interface TabsRootProps {
  defaultValue: string;
  value?: string;
  onChange?: (value: string) => void;
  variant?: "default" | "underline" | "pills";
  children: ReactNode;
  className?: string;
}

export function TabsRoot({ defaultValue, value, onChange, variant = "default", children, className = "" }: TabsRootProps) {
  const [activeTab, setActiveTab] = useState(value || defaultValue);

  const handleTabChange = (tab: string) => {
    if (value === undefined) {
      setActiveTab(tab);
    }
    onChange?.(tab);
  };

  return (
    <TabsContext.Provider value={{ activeTab, onTabChange: handleTabChange, variant }}>
      <div className={className}>{children}</div>
    </TabsContext.Provider>
  );
}

interface TabsListProps {
  children: ReactNode;
  className?: string;
  "aria-label"?: string;
}

export function TabsList({ children, className = "", "aria-label": ariaLabel }: TabsListProps) {
  const { variant = "default" } = useTabsContext();
  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className={`flex gap-1 ${variant === "underline" ? "border-b border-[var(--color-border)]" : ""} ${className}`}
    >
      {children}
    </div>
  );
}

interface TabsTriggerProps {
  value: string;
  children: ReactNode;
  disabled?: boolean;
  className?: string;
}

export function TabsTrigger({ value, children, disabled, className = "" }: TabsTriggerProps) {
  const { activeTab, onTabChange, variant = "default" } = useTabsContext();
  const isActive = activeTab === value;

  const baseStyles = "px-4 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-focus-ring)] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";

  const variantStyles = {
    default: isActive
      ? "bg-[var(--color-primary-light)] text-[var(--color-primary)]"
      : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-background)]",
    underline: isActive
      ? "border-b-2 border-[var(--color-primary)] text-[var(--color-primary)] -mb-px"
      : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] border-b-2 border-transparent",
    pills: isActive
      ? "bg-[var(--color-primary)] text-white"
      : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-background)] rounded-lg",
  };

  return (
    <button
      role="tab"
      aria-selected={isActive}
      aria-controls={`panel-${value}`}
      id={`tab-${value}`}
      onClick={() => !disabled && onTabChange(value)}
      disabled={disabled}
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
    >
      {children}
    </button>
  );
}

interface TabsContentProps {
  value: string;
  children: ReactNode;
  className?: string;
}

export function TabsContent({ value, children, className = "" }: TabsContentProps) {
  const { activeTab } = useTabsContext();
  const isActive = activeTab === value;

  if (!isActive) return null;

  return (
    <div
      role="tabpanel"
      id={`panel-${value}`}
      aria-labelledby={`tab-${value}`}
      className={`mt-4 animate-fade-in ${className}`}
    >
      {children}
    </div>
  );
}

export const Tabs = Object.assign(TabsRoot, {
  List: TabsList,
  Trigger: TabsTrigger,
  Content: TabsContent,
});