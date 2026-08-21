import React, { ElementType, HTMLAttributes } from 'react';

export interface TypographyProps extends HTMLAttributes<HTMLElement> {
  variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'lede' | 'body' | 'eyebrow' | 'small';
  as?: ElementType;
  align?: 'left' | 'center' | 'right';
  className?: string;
  children: React.ReactNode;
}

export function Typography({ 
  variant = 'body', 
  as, 
  align = 'left',
  className = '', 
  children,
  ...props 
}: TypographyProps) {
  const variantStyles = {
    h1: "text-[clamp(34px,4.8vw,56px)] font-extrabold leading-[1.15] tracking-[-0.03em] m-0",
    h2: "text-[clamp(28px,3.5vw,42px)] font-bold leading-[1.2] tracking-[-0.02em] m-0",
    h3: "text-[clamp(22px,2.5vw,32px)] font-bold leading-[1.25] tracking-[-0.01em] m-0",
    h4: "text-xl font-bold leading-[1.3] m-0",
    h5: "text-lg font-bold leading-[1.35] m-0",
    h6: "text-base font-bold leading-[1.4] m-0",
    lede: "text-[clamp(15px,1.6vw,18px)] leading-[1.65] font-light",
    body: "text-base leading-[1.6]",
    eyebrow: "text-[11px] font-bold uppercase tracking-[0.15em] text-[#ffb7c5] inline-block",
    small: "text-sm leading-[1.5] text-ink-soft"
  };

  const alignStyles = {
    left: "text-left",
    center: "text-center",
    right: "text-right"
  };

  const defaultElements: Record<string, ElementType> = {
    h1: 'h1',
    h2: 'h2',
    h3: 'h3',
    h4: 'h4',
    h5: 'h5',
    h6: 'h6',
    lede: 'p',
    body: 'p',
    eyebrow: 'span',
    small: 'small'
  };

  const Component = as || defaultElements[variant];
  const combinedClasses = `${variantStyles[variant]} ${alignStyles[align]} ${className}`.trim();

  return (
    <Component className={combinedClasses} {...props}>
      {children}
    </Component>
  );
}
