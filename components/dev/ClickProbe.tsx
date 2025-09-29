"use client";

import { useEffect, useState } from "react";

export function ClickProbe() {
  const [isProbeMode, setIsProbeMode] = useState(false);
  const [probeElement, setProbeElement] = useState<HTMLElement | null>(null);

  useEffect(() => {
    // Only run in development
    if (process.env.NODE_ENV === "production") return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && e.key === "p") {
        e.preventDefault();
        setIsProbeMode(!isProbeMode);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isProbeMode]);

  useEffect(() => {
    if (!isProbeMode) {
      setProbeElement(null);
      return;
    }

    const interval = setInterval(() => {
      const element = document.elementFromPoint(
        window.innerWidth / 2,
        120
      ) as HTMLElement | null;

      if (element) {
        setProbeElement(element);
        
        // Log element details
        const computedStyle = window.getComputedStyle(element);
        console.log("Click Probe Element:", {
          tagName: element.tagName,
          id: element.id,
          className: element.className,
          position: computedStyle.position,
          zIndex: computedStyle.zIndex,
          pointerEvents: computedStyle.pointerEvents,
          opacity: computedStyle.opacity,
        });
      }
    }, 500);

    return () => clearInterval(interval);
  }, [isProbeMode]);

  // Don't render in production
  if (process.env.NODE_ENV === "production") {
    return null;
  }

  return (
    <>
      {isProbeMode && probeElement && (
        <div
          className="fixed inset-0 pointer-events-none z-[9999]"
          style={{
            outline: "2px solid red",
            outlineOffset: "2px",
          }}
        />
      )}
      {isProbeMode && (
        <div className="fixed top-4 left-4 bg-red-500 text-white px-2 py-1 rounded text-xs z-[9999]">
          Click Probe Active (Alt+P to toggle)
        </div>
      )}
    </>
  );
}

