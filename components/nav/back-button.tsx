"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

interface BackButtonProps {
  href?: string;
  label?: string;
  className?: string;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
}

export function BackButton({ 
  href, 
  label = "Back", 
  className,
  variant = "ghost" 
}: BackButtonProps) {
  const router = useRouter();

  const handleBack = () => {
    if (href) {
      router.push(href);
    } else {
      router.back();
    }
  };

  return (
    <Button
      variant={variant}
      onClick={handleBack}
      className={`inline-flex items-center gap-2 ${className || ""}`}
      data-testid="back-button"
    >
      <ArrowLeft className="h-4 w-4" />
      {label}
    </Button>
  );
}