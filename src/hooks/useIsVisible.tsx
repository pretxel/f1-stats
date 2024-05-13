import { useEffect, useState, Ref } from "react";
export function useIsVisible(ref: Ref<HTMLLIElement> & { current: any }) {
  const [isIntersecting, setIntersecting] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      setIntersecting(entry.isIntersecting);
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
