import React from 'react';
import { cn } from './cn';
import { fieldClass } from './Input';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  invalid?: boolean;
}

export const Textarea: React.FC<TextareaProps> = ({ invalid, className, ...rest }) => (
  <textarea aria-invalid={invalid || undefined} className={cn(fieldClass(invalid), 'px-4 py-2.5 text-xs sm:text-sm', className)} {...rest} />
);
