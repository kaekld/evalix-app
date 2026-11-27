"use client";

import { Subject } from "./types";

interface SubjectHeaderProps {
  subject: Subject | undefined;
  completedCount: number;
  pendingCount: number;
  cancelledCount: number;
}

export default function SubjectHeader({
  subject,
  completedCount,
  pendingCount,
  cancelledCount,
}: SubjectHeaderProps) {
  if (!subject) return null;

  const totalCount = completedCount + pendingCount + cancelledCount;

  return (
    <div className="bg-white border border-[#dedee8] rounded-xl p-5 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#f0eafb] flex items-center justify-center flex-shrink-0">
            <svg className="w-6 h-6 text-[#6543ab]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <div>
            <h2 className="font-semibold text-xl leading-relaxed text-[#232334]">
              {subject.name}
            </h2>
            <p className="font-normal text-sm leading-relaxed text-[#747487] mt-0.5">
              {subject.code}
              {subject.categoria && (
                <>
                  <span className="mx-2">·</span>
                  {subject.categoria}
                </>
              )}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2 sm:gap-3">
          <div className="hidden sm:flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#e5f2e8] text-[#336647] font-medium">
              <span className="w-2 h-2 rounded-full bg-[#336647]" aria-hidden="true"></span>
              {completedCount} realizado{completedCount !== 1 ? 's' : ''}
            </span>
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#f0eafb] text-[#6543ab] font-medium">
              <span className="w-2 h-2 rounded-full bg-[#6543ab]" aria-hidden="true"></span>
              {pendingCount} pendiente{pendingCount !== 1 ? 's' : ''}
            </span>
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#fef2f2] text-[#cc3333] font-medium">
              <span className="w-2 h-2 rounded-full bg-[#cc3333]" aria-hidden="true"></span>
              {cancelledCount} cancelado{cancelledCount !== 1 ? 's' : ''}
            </span>
          </div>
          <div className="sm:hidden flex items-center gap-2">
            <span className="px-2 py-1 rounded-full bg-[#e5f2e8] text-[#336647] text-xs font-medium">
              ✓ {completedCount}
            </span>
            <span className="px-2 py-1 rounded-full bg-[#f0eafb] text-[#6543ab] text-xs font-medium">
              ⏳ {pendingCount}
            </span>
            <span className="px-2 py-1 rounded-full bg-[#fef2f2] text-[#cc3333] text-xs font-medium">
              ✕ {cancelledCount}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-[#dedee8] flex items-center justify-between">
        <span className="font-normal text-sm text-[#747487]">
          Total de evaluaciones: <span className="font-semibold text-[#232334]">{totalCount}</span>
        </span>
      </div>
    </div>
  );
}