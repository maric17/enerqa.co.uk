import React, { HTMLAttributes } from 'react';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'solid' | 'outline' | 'glass';
  className?: string;
  children: React.ReactNode;
}

export function Badge({ 
  variant = 'outline', 
  className = '', 
  children,
  ...props 
}: BadgeProps) {
  const baseClasses = "inline-flex items-center text-xs px-3 py-1.5 rounded transition-all duration-200";
  
  const variantClasses = {
    solid: "bg-ink text-paper",
    outline: "bg-transparent border border-ink/20 text-ink",
    glass: "bg-white/10 text-white border border-white/10 hover:bg-white/20"
  };

  const combinedClasses = `${baseClasses} ${variantClasses[variant]} ${className}`.trim();

  return (
    <span className={combinedClasses} {...props}>
      {children}
    </span>
  );
}
