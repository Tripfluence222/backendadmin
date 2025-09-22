"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Bug } from "lucide-react";

export function LayoutDebugToggle() {
  const [isDebugMode, setIsDebugMode] = useState(false);

  useEffect(() => {
    // Only run in development
    if (process.env.NODE_ENV === "production") return;

    // Check if debug mode is enabled
    const debugEnabled = localStorage.getItem("__layoutDebug") === "1";
    setIsDebugMode(debugEnabled);

    // Apply debug class to body
    if (debugEnabled) {
      document.body.classList.add("debug-outline");
    } else {
      document.body.classList.remove("debug-outline");
    }
  }, []);

  const toggleDebugMode = () => {
    const newDebugMode = !isDebugMode;
    setIsDebugMode(newDebugMode);
    
    if (newDebugMode) {
      localStorage.setItem("__layoutDebug", "1");
      document.body.classList.add("debug-outline");
    } else {
      localStorage.setItem("__layoutDebug", "0");
      document.body.classList.remove("debug-outline");
    }
  };

  // Don't render in production
  if (process.env.NODE_ENV === "production") {
    return null;
  }

  return (
    <Button
      onClick={toggleDebugMode}
      variant={isDebugMode ? "default" : "outline"}
      size="icon"
      className="fixed bottom-4 right-4 z-50 h-10 w-10 rounded-full shadow-lg"
      title={isDebugMode ? "Disable layout debug" : "Enable layout debug"}
    >
      <Bug className="h-4 w-4" />
    </Button>
  );
}
