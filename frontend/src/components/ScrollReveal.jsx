import React, { useEffect, useRef, useState } from 'react';

export const ScrollReveal = ({ children, delay = 0 }) => {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(element); // Останавливаем наблюдение после первого показа
        }
      },
      {
        threshold: 0.05, // Срабатывает, когда видны хотя бы 5% элемента
        rootMargin: '0px 0px -20px 0px' // Срабатывает чуть раньше границы
      }
    );

    observer.observe(element);

    return () => {
      if (element) {
        observer.unobserve(element);
      }
      observer.disconnect();
    };
  }, []);

  return (
    <div
      ref={ref}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(16px)',
        transition: 'opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1), transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
        transitionDelay: `${delay}ms`
      }}
    >
      {children}
    </div>
  );
};
