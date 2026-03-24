import { useEffect, useState, Ref } from "react";
export function useIsVisible(ref: Ref<HTMLLIElement> & { current: any }) {
  const [isIntersecting, setIntersecting] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIntersecting(true);
        observer.disconnect();
      }
    });

    if (ref && ref?.current) {
      observer.observe(ref?.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [ref]);

  return isIntersecting;
}
