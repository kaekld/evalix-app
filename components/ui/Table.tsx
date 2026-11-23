"use client";

import { HTMLAttributes, forwardRef, ThHTMLAttributes, TdHTMLAttributes } from "react";

export interface TableProps extends HTMLAttributes<HTMLTableElement> {
  striped?: boolean;
  hoverable?: boolean;
  compact?: boolean;
}

export const Table = forwardRef<HTMLTableElement, TableProps>(
  ({ striped = false, hoverable = true, compact = false, className = "", children, ...props }, ref) => {
    return (
      <div className="overflow-x-auto">
        <table
          ref={ref}
          className={`w-full text-sm ${className}`}
          {...props}
        >
          {children}
        </table>
      </div>
    );
  }
);

Table.displayName = "Table";

export const TableHeader = forwardRef<HTMLTableSectionElement, HTMLAttributes<HTMLTableSectionElement>>(
  ({ className = "", children, ...props }, ref) => (
    <thead ref={ref} className={`bg-[var(--color-background)] border-b border-[var(--color-border)] ${className}`} {...props}>
      {children}
    </thead>
  )
);

TableHeader.displayName = "TableHeader";

export const TableBody = forwardRef<HTMLTableSectionElement, HTMLAttributes<HTMLTableSectionElement>>(
  ({ className = "", children, ...props }, ref) => (
    <tbody ref={ref} className={`divide-y divide-[var(--color-border)] ${className}`} {...props}>
      {children}
    </tbody>
  )
);

TableBody.displayName = "TableBody";

export const TableRow = forwardRef<HTMLTableRowElement, HTMLAttributes<HTMLTableRowElement> & { striped?: boolean; hoverable?: boolean; selected?: boolean }>(
  ({ striped = false, hoverable = true, selected = false, className = "", children, ...props }, ref) => (
    <tr
      ref={ref}
      className={`
        transition-colors
        ${hoverable ? "hover:bg-[var(--color-background)]" : ""}
        ${selected ? "bg-[var(--color-primary-light)]" : ""}
        ${striped ? "even:bg-[var(--color-background)]" : ""}
        ${className}
      `}
      {...props}
    >
      {children}
    </tr>
  )
);

TableRow.displayName = "TableRow";

export const TableHead = forwardRef<HTMLTableCellElement, ThHTMLAttributes<HTMLTableCellElement> & { width?: string }>(
  ({ width, className = "", children, ...props }, ref) => (
    <th
      ref={ref}
      scope="col"
      style={{ width }}
      className={`px-4 py-3 text-left text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider ${className}`}
      {...props}
    >
      {children}
    </th>
  )
);

TableHead.displayName = "TableHead";

export const TableCell = forwardRef<HTMLTableCellElement, TdHTMLAttributes<HTMLTableCellElement> & { align?: "left" | "center" | "right" }>(
  ({ align = "left", className = "", children, ...props }, ref) => (
    <td
      ref={ref}
      className={`px-4 py-3 text-[var(--color-text-primary)] ${align === "center" ? "text-center" : align === "right" ? "text-right" : ""} ${className}`}
      {...props}
    >
      {children}
    </td>
  )
);

TableCell.displayName = "TableCell";

export const TableFooter = forwardRef<HTMLTableSectionElement, HTMLAttributes<HTMLTableSectionElement>>(
  ({ className = "", children, ...props }, ref) => (
    <tfoot ref={ref} className={`bg-[var(--color-background)] border-t border-[var(--color-border)] ${className}`} {...props}>
      {children}
    </tfoot>
  )
);

TableFooter.displayName = "TableFooter";

export interface TablePaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export function TablePagination({ currentPage, totalPages, onPageChange, className = "" }: TablePaginationProps) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  const visiblePages = pages.filter(
    (p) => p === 1 || p === totalPages || (p >= currentPage - 1 && p <= currentPage + 1)
  );

  return (
    <nav className={`flex items-center justify-between px-4 py-3 border-t border-[var(--color-border)] ${className}`} aria-label="Paginación">
      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-2 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] disabled:opacity-50 rounded-lg hover:bg-[var(--color-border)] transition-colors"
          aria-label="Página anterior"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        </button>
        <span className="text-sm text-[var(--color-text-secondary)]">
          Página {currentPage} de {totalPages}
        </span>
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-2 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] disabled:opacity-50 rounded-lg hover:bg-[var(--color-border)] transition-colors"
          aria-label="Página siguiente"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
        </button>
      </div>
      <div className="flex items-center gap-1">
        {visiblePages.map((page, index) => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`w-8 h-8 rounded-lg font-medium text-sm transition-colors ${
              page === currentPage
                ? "bg-[var(--color-primary)] text-white"
                : "text-[var(--color-text-secondary)] hover:bg-[var(--color-border)] hover:text-[var(--color-text-primary)]"
            }`}
            aria-label={`Página ${page}`}
            aria-current={page === currentPage ? "page" : undefined}
          >
            {page}
          </button>
        ))}
      </div>
    </nav>
  );
}