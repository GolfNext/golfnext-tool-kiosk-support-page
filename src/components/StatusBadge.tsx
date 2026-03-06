"use client";

import { useState, useEffect } from "react";
import { isHotlineOpen, getOpeningTimeLocal } from "@/lib/time";
import type { Translations } from "@/lib/locale-types";

interface StatusBadgeProps {
  translations: Translations;
}

export function StatusBadge({ translations }: StatusBadgeProps) {
  const [open, setOpen] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setOpen(isHotlineOpen());

    // Update status every minute
    const interval = setInterval(() => {
      setOpen(isHotlineOpen());
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  if (!mounted) {
    return null; // Prevent hydration mismatch
  }

  const openingTime = getOpeningTimeLocal().split(" ").slice(0, 1).join(" "); // Get just the time part

  return (
    <div className="flex items-center justify-center gap-3 py-4">
      {open ? (
        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-lime/20 border border-lime">
          <div className="w-3 h-3 rounded-full bg-lime" />
          <span className="font-sora font-semibold text-lime">
            {translations["hotline.status.open"] || "Open"}
          </span>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-1">
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-error-red/20 border border-error-red">
            <div className="w-3 h-3 rounded-full bg-error-red" />
            <span className="font-sora font-semibold text-error-red">
              {translations["hotline.status.closed"] || "Closed"}
            </span>
          </div>
          <span className="text-sm text-neutral">
            {(translations["hotline.status.opens_at"] || "Opens at {time} CET").replace(
              "{time}",
              openingTime
            )}
          </span>
        </div>
      )}
    </div>
  );
}
