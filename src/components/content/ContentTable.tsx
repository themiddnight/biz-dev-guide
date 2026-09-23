import React from 'react';
import { ChevronDown } from 'lucide-react';
import { TAP_Y } from '../ui/tapTarget';
import { ContentBlock } from '../../types';
import { RichText } from './RichText';

type TableBlock = Extract<ContentBlock, { kind: 'table' }>;

interface ContentTableProps {
  block: TableBlock;
  onNavigateChapter?: (chapterId: string) => void;
}

const widthClass = (hint?: 'narrow' | 'wide') =>
  hint === 'narrow' ? 'w-[18%]' : hint === 'wide' ? 'w-[40%]' : '';

const titleClass = 'text-xs sm:text-sm font-bold text-base-content';
const introClass = 'text-xs sm:text-sm text-base-content-secondary leading-relaxed';
const footnoteClass =
  'text-[11px] sm:text-xs text-base-content-muted leading-relaxed p-3 rounded-xl bg-base-300 border border-base-border';
const thClass =
  'px-3 py-2 text-left align-bottom text-[10px] sm:text-[11px] tracking-wider uppercase font-semibold text-base-content-muted border-b border-base-border-strong';
const tdClass =
  'px-3 py-2.5 align-top text-xs sm:text-sm text-base-content-body leading-relaxed border-b border-base-border';

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
                mode === 'scroll' && cIdx === 0 ? 'sticky left-0 z-10 bg-base-100' : ''
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
                  cIdx === 0 ? 'font-medium text-base-content' : ''
                } ${mode === 'scroll' && cIdx === 0 ? 'sticky left-0 z-10 bg-base-100' : ''}`}
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
            className="pointer-events-none absolute inset-y-0 right-0 w-6 bg-linear-to-l from-base-100 to-transparent sm:hidden"
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
                className="p-3 rounded-xl bg-base-300 border border-base-border space-y-2"
              >
                {firstCol && (
                  <div className="text-xs font-bold text-base-content leading-snug">
                    {renderCell(row.cells[firstCol.key])}
                  </div>
                )}
                <dl className="space-y-1.5">
                  {restCols.map(col => (
                    <div key={col.key}>
                      <dt className="text-[10px] tracking-wider uppercase font-semibold text-base-content-muted">
                        {col.label}
                      </dt>
                      <dd className="text-xs text-base-content-body leading-relaxed break-words">
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
      <details className="group rounded-xl border border-base-border bg-base-100 overflow-hidden">
        <summary className={`${TAP_Y} flex items-center justify-between gap-2 p-3 sm:p-3.5 cursor-pointer select-none list-none [&::-webkit-details-marker]:hidden bg-base-300 hover:bg-base-border transition-colors`}>
          <span className={titleClass}>{block.title ?? 'ตาราง'}</span>
          <ChevronDown className="w-4 h-4 shrink-0 text-base-content-muted transition-transform group-open:rotate-180" />
        </summary>
        <div className="p-3 sm:p-4 border-t border-base-border">{body}</div>
      </details>
    );
  }

  return body;
};
