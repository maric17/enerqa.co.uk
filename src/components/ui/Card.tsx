import React, { HTMLAttributes } from 'react';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'alt' | 'glass';
  className?: string;
  children: React.ReactNode;
}

export function Card({ 
  variant = 'default', 
  className = '', 
  children,
  ...props 
}: CardProps) {
  const baseClasses = "rounded-[12px] overflow-hidden transition-all duration-300";
  
  const variantClasses = {
    default: "bg-card border border-line shadow-sm hover:shadow-md",
    alt: "bg-paper-alt border border-line",
    glass: "bg-white/10 backdrop-blur-md border border-white/20 text-white shadow-xl"
  };

  const combinedClasses = `${baseClasses} ${variantClasses[variant]} ${className}`.trim();

  return (
    <div className={combinedClasses} {...props}>
      {children}
    </div>
  );
}
