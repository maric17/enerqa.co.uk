import React from 'react';

import Link from 'next/link';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: string;
  href?: string;
  target?: string;
  rel?: string;
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
    primary: "bg-ink text-paper hover:bg-green px-6 py-3 rounded-[100px] hover:-translate-y-0.5",
    secondary: "bg-transparent border-[1.5px] border-ink text-ink hover:bg-paper-alt px-6 py-3 rounded-[100px] hover:-translate-y-0.5",
    ghost: "bg-transparent text-ink hover:bg-ink/5 hover:text-green px-4 py-2 rounded-md hover:-translate-y-0.5",
    outline: "bg-transparent border-[1.5px] border-white text-white hover:bg-white hover:text-ink px-6 py-3 rounded-[100px] hover:-translate-y-0.5",
    dark: "bg-ink-soft text-paper hover:bg-green px-6 py-3 rounded-[100px] hover:-translate-y-0.5"
  };

  const combinedClasses = `${baseClasses} ${variantClasses[variant] || variantClasses.primary} ${className}`.trim();

  if (href) {
    const { target, rel, ...rest } = props;
    return (
      <Link href={href} className={combinedClasses} target={target} rel={rel}>
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
