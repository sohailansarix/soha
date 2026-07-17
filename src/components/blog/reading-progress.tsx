"use client";

import * as React from "react";

export function ReadingProgress() {
  const [progress, setProgress] = React.useState(0);

  React.useEffect(() => {
    function onScroll() {
      const el = document.documentElement;
      const scrollTop = el.scrollTop;
      const height = el.scrollHeight - el.clientHeight;
      setProgress(height > 0 ? (scrollTop / height) * 100 : 0);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="fixed left-0 top-0 z-50 h-1 w-full bg-transparent">
      <div className="h-1 bg-accent transition-[width] duration-150" style={{ width: `${progress}%` }} />
    </div>
  );
}
