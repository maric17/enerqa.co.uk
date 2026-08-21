import React, { HTMLAttributes } from 'react';

export interface ContainerProps extends HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function Container({ children, className = '', ...props }: ContainerProps) {
  return (
    <div className={`w-full max-w-[1280px] mx-auto px-6 md:px-10 ${className}`} {...props}>
      {children}
    </div>
  );
}
