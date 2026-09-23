import React from 'react';
import { cn } from './cn';

/** A soft callout. role="status" only when `live` (its text changes while the reader is on the page). */
export interface AlertProps {
  color: 'info' | 'success' | 'warning' | 'error';
  title?: React.ReactNode;
  icon?: React.ReactNode;
  live?: boolean;
  className?: string;
  children: React.ReactNode;
}

const TONE: Record<AlertProps['color'], { box: string; accent: string }> = {
  info: { box: 'bg-info/10 border-info/25', accent: 'text-info' },
  success: { box: 'bg-success/10 border-success/25', accent: 'text-success' },
  warning: { box: 'bg-warning/10 border-warning/25', accent: 'text-warning' },
  error: { box: 'bg-error/10 border-error/25', accent: 'text-error' },
};

export const Alert: React.FC<AlertProps> = ({ color, title, icon, live, className, children }) => (
  <div
    role={live ? 'status' : undefined}
    className={cn('flex items-start gap-2.5 p-box rounded-box border text-xs sm:text-sm text-base-content-body', TONE[color].box, className)}
  >
    {icon && <span className={cn('shrink-0 mt-0.5', TONE[color].accent)} aria-hidden="true">{icon}</span>}
    <div className="min-w-0 space-y-1">
      {title && <div className={cn('font-bold', TONE[color].accent)}>{title}</div>}
      <div>{children}</div>
    </div>
  </div>
);
