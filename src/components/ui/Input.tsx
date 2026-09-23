import React from 'react';
import { cn } from './cn';

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  size?: 'sm' | 'md';
  invalid?: boolean;
}

/** Field surface without padding: shared by Input and Textarea, and by raw fields with custom padding. */
export function fieldClass(invalid?: boolean): string {
  return cn(
    'w-full rounded-field bg-base-100 border text-base-content placeholder-base-content-subtle transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-50 disabled:cursor-not-allowed',
    invalid ? 'border-error' : 'border-base-border focus:border-base-border-strong',
  );
}

const SIZE: Record<NonNullable<InputProps['size']>, string> = {
  sm: 'px-3 py-2 text-xs',
  md: 'px-4 py-2.5 text-xs sm:text-sm',
};

export const Input: React.FC<InputProps> = ({ size = 'md', invalid, className, ...rest }) => (
  <input aria-invalid={invalid || undefined} className={cn(fieldClass(invalid), SIZE[size], className)} {...rest} />
);
