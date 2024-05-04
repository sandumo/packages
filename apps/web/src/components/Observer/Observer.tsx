import { useEffect, useRef } from 'react';

interface ObserverProps {
  children: React.ReactNode;
  onAppearance?: () => void;
  treshold?: number;
  rootMargin?: string;
}

export default function Observer({ children, onAppearance = () => {}, treshold = 1, rootMargin = '0px', ...props }: ObserverProps) {
  const ref = useRef(null);

  useEffect(() => {
    if (ref.current) {
      const observer = new IntersectionObserver(entries => {
        const [ entry ] = entries;
        if (entry.isIntersecting) {
          onAppearance();
          observer.unobserve(entry.target);
        }
      }, { threshold: treshold, rootMargin: rootMargin });
      observer.observe(ref.current);

      const current = ref.current;

      return () => observer.unobserve(current);
    }
  }, [onAppearance, rootMargin, treshold]);

  return (
    <div ref={ref} {...props}>
      {children}
    </div>
  );
}

