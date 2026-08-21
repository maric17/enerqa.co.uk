import React, { HTMLAttributes } from 'react';

export interface SectionProps extends HTMLAttributes<HTMLElement> {
  children: React.ReactNode;
  containerClassName?: string;
  fullWidth?: boolean;
}

export function Section({ 
  children, 
  className = '', 
  containerClassName = '',
  fullWidth = false,
  ...props 
}: SectionProps) {
  return (
    <section className={`py-12 md:py-24 ${className}`} {...props}>
      <div className={fullWidth ? 'w-full' : `max-w-[1280px] mx-auto px-10 ${containerClassName}`}>
        {children}
      </div>
    </section>
  );
}
