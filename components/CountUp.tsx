'use client';
import { FC, useRef, useEffect, useState } from 'react';

interface CountUpProps {
  value: number;
  suffix?: string;
  duration?: number;
  className?: string;
}

const CountUp: FC<CountUpProps> = ({ 
  value, 
  suffix = '', 
  duration = 3000, 
  className = '' 
}) => {
  const [displayValue, setDisplayValue] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  // Calculate dynamic duration based on value - larger numbers get faster animation
  const dynamicDuration = value >= 1000 ? Math.min(duration * 0.6, 1800) : duration;

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasAnimated) {
            setHasAnimated(true);
            animateCount();
          }
        });
      },
      { threshold: 0.1, rootMargin: '-50px' }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, [hasAnimated]);

  const animateCount = () => {
    const startTime = performance.now();
    const startValue = 0;
    const endValue = value;

    const updateCount = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / dynamicDuration, 1);
      
      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const currentValue = Math.floor(startValue + (endValue - startValue) * easeOutQuart);
      
      setDisplayValue(currentValue);

      if (progress < 1) {
        requestAnimationFrame(updateCount);
      }
    };

    requestAnimationFrame(updateCount);
  };

  return (
    <span ref={ref} className={className} aria-live="polite">
      {displayValue.toLocaleString()}{suffix}
    </span>
  );
};

export default CountUp; 