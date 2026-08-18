'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function ScrollReveal() {
  const pathname = usePathname();

  useEffect(() => {
    const reveals = document.querySelectorAll('.reveal');

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
        }
      });
    }, {
      root: null,
      rootMargin: '0px',
      threshold: 0.1
    });

    reveals.forEach(element => {
      observer.observe(element);
      
      // Safety fallback: if element is high up, animate it immediately
      if (element.getBoundingClientRect().top < window.innerHeight) {
        element.classList.add('in');
      }
    });

    return () => {
      reveals.forEach(element => {
        observer.unobserve(element);
      });
    };
  }, [pathname]); // Re-run whenever the route changes

  return null; // This component does not render anything
}
