import React, { HTMLAttributes } from 'react';
import { Container } from './Container';

export interface SectionProps extends HTMLAttributes<HTMLElement> {
  children: React.ReactNode;
  containerClassName?: string;
  fullWidth?: boolean;
  theme?: string;
}

export function Section({ 
  children, 
  className = '', 
  containerClassName = '',
  fullWidth = false,
  theme = '',
  ...props 
}: SectionProps) {
  let themeClasses = '';
  switch(theme) {
    case 'dark': themeClasses = 'bg-ink text-white'; break;
    case 'light': themeClasses = 'bg-paper text-ink'; break;
    case 'muted': themeClasses = 'bg-paper-alt text-ink'; break;
    case 'white': themeClasses = 'bg-white text-ink'; break;
  }

  return (
    <section className={`py-12 md:py-24 ${themeClasses} ${className}`.trim()} {...props}>
      {fullWidth ? (
        <div className="w-full">
          {children}
        </div>
      ) : (
        <Container className={containerClassName}>
          {children}
        </Container>
      )}
    </section>
  );
}
