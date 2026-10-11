import React from 'react';
import { DISCLOSURE_SUMMARY, DisclosureChevron } from '../ui/Disclosure';
import { ContentBlock } from '../../types';
import { RichText } from './RichText';

type TableBlock = Extract<ContentBlock, { kind: 'table' }>;

interface ContentTableProps {
  block: TableBlock;
  onNavigateChapter?: (chapterId: string) => void;
}

const widthClass = (hint?: 'narrow' | 'wide') =>
  hint === 'narrow' ? 'w-[18%]' : hint === 'wide' ? 'w-[40%]' : '';

const titleClass = 'font-semibold text-base-content';
const introClass = 'text-base-content-secondary';
const footnoteClass = 'text-sm text-base-content-muted';
const thClass =
  'px-3 py-2 text-left align-bottom text-sm font-semibold text-base-content-muted border-b border-base-border-strong';
const tdClass =
  'px-3 py-2.5 align-top text-sm leading-6 text-base-content-body border-b border-base-border';

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

          {/* Mobile (<640px): one block per row on a hairline; the first column is its title */}
          <div className="sm:hidden">
            {block.title && !block.collapsed && <h4 className={titleClass}>{block.title}</h4>}
            <div className="divide-y divide-base-border border-y border-base-border">
              {block.rows.map((row, rIdx) => (
                <div key={rIdx} className="space-y-2 py-3">
                  {firstCol && (
                    <div className="font-semibold text-base-content">{renderCell(row.cells[firstCol.key])}</div>
                  )}
                  <dl className="space-y-1.5">
                    {restCols.map(col => (
                      <div key={col.key}>
                        <dt className="text-sm text-base-content-muted">{col.label}</dt>
                        <dd className="break-words">{renderCell(row.cells[col.key])}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              ))}
            </div>
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
      <details className="group rounded-box border border-base-border overflow-hidden">
        <summary className={DISCLOSURE_SUMMARY}>
          <span className={titleClass}>{block.title ?? 'ตาราง'}</span>
          <DisclosureChevron />
        </summary>
        <div className="p-box-dense border-t border-base-border">{body}</div>
      </details>
    );
  }

  return body;
};
