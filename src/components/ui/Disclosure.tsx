import React from 'react';
import { ChevronDown } from 'lucide-react';
import { TAP_Y } from './tapTarget';

/**
 * Shared `<details>` disclosure styling. The parent `<details>` must carry `group` so the
 * chevron flips when it opens.
 */

/** A details summary laid out as a title row with the native marker hidden. */
export const SUMMARY_ROW =
  'flex items-center justify-between gap-2 cursor-pointer select-none list-none [&::-webkit-details-marker]:hidden';

/** The boxed summary bar used by collapsible content blocks, tables and diagrams. */
export const DISCLOSURE_SUMMARY = `${TAP_Y} ${SUMMARY_ROW} p-box-dense bg-base-300 hover:bg-base-border transition-colors`;

export const DisclosureChevron: React.FC = () => (
  <ChevronDown className="w-4 h-4 shrink-0 text-base-content-muted transition-transform group-open:rotate-180" />
);
