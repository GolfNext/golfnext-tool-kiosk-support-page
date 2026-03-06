"use client";

import { useState, useEffect } from "react";
import { isHotlineOpen } from "@/lib/time";
import type { Translations } from "@/lib/locale-types";

interface PhoneEmailSectionProps {
  translations: Translations;
}

export function PhoneEmailSection({ translations }: PhoneEmailSectionProps) {
  const [open, setOpen] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setOpen(isHotlineOpen());

    const interval = setInterval(() => {
      setOpen(isHotlineOpen());
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <section className="w-full max-w-[480px] mx-auto px-4 py-6">
      {/* Phone number CTA */}
      <a
        href={open ? "tel:+4570707999" : undefined}
        className={`block w-full py-4 px-6 rounded-lg text-center font-sora font-semibold text-lg min-h-[56px] transition-all ${
          open
            ? "bg-lime text-midnight-green hover:bg-lime-accent cursor-pointer shadow-lg"
            : "bg-neutral/20 text-neutral/40 cursor-not-allowed"
        }`}
        onClick={(e) => !open && e.preventDefault()}
      >
        {translations["hotline.phone.call_button"] || "Call now: +45 70 70 79 99"}
      </a>

      {/* Email (always visible) */}
      <div className="mt-4 text-center">
        <p className="text-sm font-manrope text-neutral mb-2">
          {translations["hotline.email.label"] || "Or email us at"}
        </p>
        <a
          href="mailto:support@golfnext.com"
          className="text-lime hover:text-lime-accent font-manrope underline"
        >
          support@golfnext.com
        </a>
      </div>
    </section>
  );
}
