import React from 'react';

interface IndexEmptyStateProps {
  query: string;
  /** A role chip other than "ทั้งหมด" is active. */
  roleFiltered: boolean;
  onClear: () => void;
}

/** Shown in the chapter index when search and role chip leave no chapter (role UX fixes P4.2). */
export const IndexEmptyState: React.FC<IndexEmptyStateProps> = ({ query, roleFiltered, onClear }) => (
  <div data-index-empty="" role="status" className="p-4 space-y-2 text-xs text-neutral-500 dark:text-[#8e8e8e]">
    <p className="break-words">ไม่พบบทที่มีคำว่า "{query.trim()}"</p>
    <p>{roleFiltered ? 'ลองกด "ทั้งหมด" หรือใช้คำอื่น' : 'ลองคำที่สั้นลง หรือค้นเป็นภาษาอังกฤษ'}</p>
    <button
      type="button"
      onClick={onClear}
      className="px-2.5 py-1 rounded-lg font-medium whitespace-nowrap transition-all cursor-pointer bg-neutral-100 dark:bg-[#1f1f1f] text-neutral-600 dark:text-[#a3a3a3] hover:bg-neutral-200 dark:hover:bg-[#262626]"
    >
      ล้างการค้นหา
    </button>
  </div>
);
