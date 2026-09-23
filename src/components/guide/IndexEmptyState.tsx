import React from 'react';
import { TAP } from '../ui/tapTarget';

interface IndexEmptyStateProps {
  query: string;
  /** A role chip other than "ทั้งหมด" is active. */
  roleFiltered: boolean;
  onClear: () => void;
}

/** Shown in the chapter index when search and role chip leave no chapter (role UX fixes P4.2). */
export const IndexEmptyState: React.FC<IndexEmptyStateProps> = ({ query, roleFiltered, onClear }) => (
  <div data-index-empty="" role="status" className="p-4 space-y-2 text-xs text-base-content-muted">
    <p className="break-words">ไม่พบบทที่มีคำว่า "{query.trim()}"</p>
    <p>{roleFiltered ? 'ลองกด "ทั้งหมด" หรือใช้คำอื่น' : 'ลองคำที่สั้นลง หรือค้นเป็นภาษาอังกฤษ'}</p>
    <button
      type="button"
      onClick={onClear}
      className={`${TAP} px-2.5 py-1 rounded-lg font-medium whitespace-nowrap transition-all cursor-pointer bg-base-300 text-base-content-secondary hover:bg-base-border`}
    >
      ล้างการค้นหา
    </button>
  </div>
);
