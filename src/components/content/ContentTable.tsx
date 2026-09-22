import React from 'react';
import { ChevronDown } from 'lucide-react';
import { ContentBlock } from '../../types';
import { RichText } from './RichText';

type TableBlock = Extract<ContentBlock, { kind: 'table' }>;

interface ContentTableProps {
  block: TableBlock;
  onNavigateChapter?: (chapterId: string) => void;
}

const widthClass = (hint?: 'narrow' | 'wide') =>
  hint === 'narrow' ? 'w-[18%]' : hint === 'wide' ? 'w-[40%]' : '';

const titleClass = 'text-xs sm:text-sm font-bold text-neutral-900 dark:text-[#fafafa]';
const introClass = 'text-xs sm:text-sm text-neutral-600 dark:text-[#a3a3a3] leading-relaxed';
const footnoteClass =
  'text-[11px] sm:text-xs text-neutral-500 dark:text-[#8e8e8e] leading-relaxed p-3 rounded-xl bg-neutral-50 dark:bg-[#181818] border border-neutral-200 dark:border-[#262626]';
const thClass =
  'px-3 py-2 text-left align-bottom font-mono text-[10px] sm:text-[11px] tracking-wider uppercase font-semibold text-neutral-500 dark:text-[#8e8e8e] border-b border-neutral-300 dark:border-[#333333]';
const tdClass =
  'px-3 py-2.5 align-top text-xs sm:text-sm text-neutral-700 dark:text-[#d4d4d4] leading-relaxed border-b border-neutral-200 dark:border-[#262626]';

export const ContentTable: React.FC<ContentTableProps> = ({ block, onNavigateChapter }) => {
  const mode = block.mobile ?? 'stack';
  const [firstCol, ...restCols] = block.columns;

  const renderCell = (value: string | undefined) =>
    value ? <RichText text={value} onNavigateChapter={onNavigateChapter} /> : null;

  const desktopTable = (
    <table className={mode === 'scroll' ? 'w-full min-w-[560px] border-collapse' : 'hidden sm:table w-full border-collapse'}>
      {block.title && !block.collapsed && (
        <caption className={`${titleClass} text-left pb-2`}>{block.title}</caption>
      )}
      <thead>
        <tr>
          {block.columns.map((col, cIdx) => (
            <th
              key={col.key}
              scope="col"
              className={`${thClass} ${widthClass(col.widthHint)} ${
                mode === 'scroll' && cIdx === 0 ? 'sticky left-0 z-10 bg-white dark:bg-[#141414]' : ''
              }`}
            >
              {col.label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {block.rows.map((row, rIdx) => (
          <tr key={rIdx}>
            {block.columns.map((col, cIdx) => (
              <td
                key={col.key}
                className={`${tdClass} ${
                  cIdx === 0 ? 'font-medium text-neutral-900 dark:text-[#e5e5e5]' : ''
                } ${mode === 'scroll' && cIdx === 0 ? 'sticky left-0 z-10 bg-white dark:bg-[#141414]' : ''}`}
              >
                {renderCell(row.cells[col.key])}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );

  const body = (
    <div className="space-y-3">
      {block.intro && (
        <p className={introClass}>
          <RichText text={block.intro} onNavigateChapter={onNavigateChapter} />
        </p>
      )}

      {mode === 'scroll' ? (
        <div className="relative">
          <div className="overflow-x-auto">{desktopTable}</div>
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 right-0 w-6 bg-linear-to-l from-white dark:from-[#141414] to-transparent sm:hidden"
          />
        </div>
      ) : (
        <>
          {desktopTable}

          {/* Mobile (<640px): one card per row; first column is the card title */}
          <div className="sm:hidden space-y-2.5">
            {block.title && !block.collapsed && <h4 className={titleClass}>{block.title}</h4>}
            {block.rows.map((row, rIdx) => (
              <div
                key={rIdx}
                className="p-3 rounded-xl bg-neutral-50 dark:bg-[#181818] border border-neutral-200 dark:border-[#262626] space-y-2"
              >
                {firstCol && (
                  <div className="text-xs font-bold text-neutral-900 dark:text-[#fafafa] leading-snug">
                    {renderCell(row.cells[firstCol.key])}
                  </div>
                )}
                <dl className="space-y-1.5">
                  {restCols.map(col => (
                    <div key={col.key}>
                      <dt className="font-mono text-[10px] tracking-wider uppercase font-semibold text-neutral-500 dark:text-[#8e8e8e]">
                        {col.label}
                      </dt>
                      <dd className="text-xs text-neutral-700 dark:text-[#d4d4d4] leading-relaxed break-words">
                        {renderCell(row.cells[col.key])}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            ))}
          </div>
        </>
      )}

      {block.footnote && (
        <p className={footnoteClass}>
          <RichText text={block.footnote} onNavigateChapter={onNavigateChapter} />
        </p>
      )}
    </div>
  );

  if (block.collapsed) {
    return (
      <details className="group rounded-xl border border-neutral-200 dark:border-[#262626] bg-white dark:bg-[#141414] overflow-hidden">
        <summary className="flex items-center justify-between gap-2 p-3 sm:p-3.5 cursor-pointer select-none list-none [&::-webkit-details-marker]:hidden bg-neutral-50 dark:bg-[#181818] hover:bg-neutral-100/70 dark:hover:bg-[#1f1f1f] transition-colors">
          <span className={titleClass}>{block.title ?? 'ตาราง'}</span>
          <ChevronDown className="w-4 h-4 shrink-0 text-neutral-400 dark:text-[#737373] transition-transform group-open:rotate-180" />
        </summary>
        <div className="p-3 sm:p-4 border-t border-neutral-100 dark:border-[#262626]">{body}</div>
      </details>
    );
  }

  return body;
};
