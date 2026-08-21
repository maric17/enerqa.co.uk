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
  ...props 
}: SectionProps) {
  return (
    <section className={`py-12 md:py-24 ${className}`} {...props}>
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
