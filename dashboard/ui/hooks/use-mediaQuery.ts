import { useEffect, useState } from "react";

export function useMediaQuery(query: { name: string; breakpoint: string }[]): { [key: string]: boolean } {
  const getMatches = (query: { name: string; breakpoint: string }[]): { [key: string]: boolean } => {
    if (typeof window !== 'undefined') {
      const matches: { [key: string]: boolean } = {};
      query.forEach(({ name, breakpoint }) => {
        matches[name] = window.matchMedia(breakpoint).matches;
      });
      return matches;
    }
    return {};
  };

  const [matches, setMatches] = useState<{ [key: string]: boolean }>(() => getMatches(query)); // Use a callback function to initialize the state

  useEffect(() => {
    const handleChange = () => {
      setMatches(getMatches(query));
    };

    const mediaQueryList: MediaQueryList[] = query.map(({ breakpoint }) => window.matchMedia(breakpoint));

    mediaQueryList.forEach((matchMedia) => {
      if (matchMedia.addEventListener) {
        matchMedia.addEventListener('change', handleChange);
      } else {
        matchMedia.addListener(handleChange);
      }
    });

    return () => {
      mediaQueryList.forEach((matchMedia) => {
        if (matchMedia.removeEventListener) {
          matchMedia.removeEventListener('change', handleChange);
        } else {
          matchMedia.removeListener(handleChange);
        }
      });
    };
  }, [query]); // Include the 'query' dependency only

  return matches;
}