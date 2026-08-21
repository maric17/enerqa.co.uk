import React, { ButtonHTMLAttributes } from 'react';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
}

export function Button({ 
  children, 
  variant = 'primary', 
  className = '', 
  ...props 
}: ButtonProps) {
  const baseClasses = "inline-flex items-center justify-center font-semibold transition-all duration-200 cursor-pointer";
  
  const variantClasses = {
    primary: "bg-ink text-paper hover:bg-green px-6 py-3 rounded-[100px]",
    secondary: "bg-transparent border-[1.5px] border-ink text-ink hover:bg-paper-alt px-6 py-3 rounded-[100px]",
    ghost: "bg-transparent text-ink hover:text-green px-4 py-2 rounded-md"
  };

  const combinedClasses = `${baseClasses} ${variantClasses[variant]} ${className}`.trim();

  return (
    <button className={combinedClasses} {...props}>
      {children}
    </button>
  );
}
