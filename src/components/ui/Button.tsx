import React, { ButtonHTMLAttributes } from 'react';

import Link from 'next/link';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: string;
  href?: string;
}

export function Button({ 
  children, 
  variant = 'primary', 
  className = '', 
  href,
  ...props 
}: ButtonProps) {
  const baseClasses = "inline-flex items-center justify-center font-semibold transition-all duration-200 cursor-pointer text-center no-underline";
  
  const variantClasses: Record<string, string> = {
    primary: "bg-ink text-paper hover:bg-green px-6 py-3 rounded-[100px]",
    secondary: "bg-transparent border-[1.5px] border-ink text-ink hover:bg-paper-alt px-6 py-3 rounded-[100px]",
    ghost: "bg-transparent text-ink hover:text-green px-4 py-2 rounded-md",
    outline: "bg-transparent border-[1.5px] border-white text-white hover:bg-white hover:text-ink px-6 py-3 rounded-[100px]",
    dark: "bg-ink-soft text-paper hover:bg-green px-6 py-3 rounded-[100px]"
  };

  const combinedClasses = `${baseClasses} ${variantClasses[variant] || variantClasses.primary} ${className}`.trim();

  if (href) {
    return (
      <Link href={href} className={combinedClasses}>
        {children}
      </Link>
    );
  }

  return (
    <button className={combinedClasses} {...props}>
      {children}
    </button>
  );
}
