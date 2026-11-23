"use client";

import { useState, useRef, useEffect, Fragment, isValidElement, cloneElement } from "react";
import { X, ChevronDown } from "lucide-react";

interface DropdownItemProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  disabled?: boolean;
  danger?: boolean;
  icon?: React.ReactNode;
}

export function DropdownItem({ onClick, children, disabled, danger, icon, className = "", ...props }: DropdownItemProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`w-full flex items-center gap-2 px-4 py-2 text-sm font-medium text-left transition-colors cursor-pointer ${
        danger
          ? "text-[var(--color-danger)] hover:bg-[var(--color-danger-bg)]"
          : "text-[var(--color-text-primary)] hover:bg-[var(--color-background)]"
      } disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      {...props}
    >
      {icon && <span className="h-4 w-4 flex-shrink-0">{icon}</span>}
      {children}
    </button>
  );
}

interface DropdownSeparatorProps extends React.HTMLAttributes<HTMLHRElement> {}

export function DropdownSeparator({ className = "", ...props }: DropdownSeparatorProps) {
  return <hr className={`my-1 border-[var(--color-border)] ${className}`} {...props} />;
}

interface DropdownTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  icon?: React.ReactNode;
}

export function DropdownTrigger({ children, icon = <ChevronDown className="h-4 w-4" />, className = "", ...props }: DropdownTriggerProps) {
  return (
    <button
      type="button"
      className={`flex items-center gap-1.5 cursor-pointer ${className}`}
      {...props}
    >
      {children}
      {icon}
    </button>
  );
}

interface DropdownMenuProps {
  children: React.ReactNode;
  className?: string;
}

export function DropdownMenu({ children, className = "" }: DropdownMenuProps) {
  return <div className={`py-1 ${className}`}>{children}</div>;
}

interface DropdownProps {
  trigger: React.ReactElement<DropdownTriggerProps>;
  items: React.ReactNode;
  align?: "left" | "right";
  width?: string | number;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function Dropdown({ trigger, items, align = "right", width = 200, open, onOpenChange }: DropdownProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const isControlled = open !== undefined;
  const currentOpen = isControlled ? open : uncontrolledOpen;

  const dropdownRef = useRef<HTMLDivElement>(null);
  const triggerWrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        if (triggerWrapperRef.current && !triggerWrapperRef.current.contains(event.target as Node)) {
          if (!isControlled) setUncontrolledOpen(false);
          onOpenChange?.(false);
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isControlled, onOpenChange]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        if (!isControlled) setUncontrolledOpen(false);
        onOpenChange?.(false);
        triggerWrapperRef.current?.querySelector("button")?.focus();
      }
    };

    if (currentOpen) {
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [currentOpen, isControlled, onOpenChange]);

  const handleTriggerClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    const nextOpen = !currentOpen;
    if (!isControlled) setUncontrolledOpen(nextOpen);
    onOpenChange?.(nextOpen);
    trigger.props.onClick?.(e);
  };

  return (
    <Fragment>
      <div ref={triggerWrapperRef} className="relative inline-block">
        {cloneElement(trigger, {
          onClick: handleTriggerClick,
          "aria-expanded": currentOpen,
          "aria-haspopup": "true",
        })}
        {currentOpen && (
          <div
            ref={dropdownRef}
            className={`absolute z-50 mt-1.5 w-[${typeof width === "number" ? `${width}px` : width}] bg-white rounded-lg border border-[var(--color-border)] shadow-lg py-1 animate-fade-in ${align === "right" ? "right-0" : "left-0"}`}
            role="menu"
          >
            {items}
          </div>
        )}
      </div>
    </Fragment>
  );
}

export type { DropdownProps };