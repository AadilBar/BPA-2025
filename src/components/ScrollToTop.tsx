import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export default function ScrollToTop() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    // Always jump to the top when the route changes.
    // Use immediate scroll to avoid interfering with lenis smooth-scrolling instance.
    try {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });
    } catch {
      // Fallback for browsers that don't support 'instant'
      window.scrollTo(0, 0);
    }

    // If there is a hash anchor, attempt to scroll to it after a tick.
    if (hash) {
      const id = hash.replace('#', '');
      setTimeout(() => {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 50);
    }
  }, [pathname, hash]);

  return null;
}
