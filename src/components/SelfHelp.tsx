"use client";

import { useState } from "react";
import type { Translations } from "@/lib/locale-types";
import type { SelfHelpItem } from "@/types";

interface SelfHelpProps {
  translations: Translations;
}

export function SelfHelp({ translations }: SelfHelpProps) {
  const [openItem, setOpenItem] = useState<number | null>(null);

  // Build FAQ items dynamically from translations
  const itemCount = parseInt(translations["selfhelp.items.count"] || "0");
  const items: SelfHelpItem[] = [];

  for (let i = 1; i <= itemCount; i++) {
    const title = translations[`selfhelp.item.${i}.title`];
    const stepCount = parseInt(
      translations[`selfhelp.item.${i}.step.count`] || "0"
    );
    const steps: string[] = [];

    for (let j = 1; j <= stepCount; j++) {
      const step = translations[`selfhelp.item.${i}.step.${j}`];
      if (step) steps.push(step);
    }

    if (title && steps.length > 0) {
      items.push({ title, steps });
    }
  }

  if (items.length === 0) {
    return null;
  }

  return (
    <section className="w-full max-w-[480px] mx-auto px-4 py-6">
      <h2 className="text-xl font-sora font-semibold text-white mb-4">
        {translations["selfhelp.title"] || "Try this first"}
      </h2>
      <div className="space-y-2">
        {items.map((item, index) => (
          <div
            key={index}
            className="rounded-lg overflow-hidden border border-white/10"
            style={{ backgroundColor: "var(--color-card-bg)" }}
          >
            <button
              onClick={() => setOpenItem(openItem === index ? null : index)}
              className="w-full px-4 py-4 flex items-center justify-between text-left min-h-[48px] hover:bg-white/5 transition-colors"
            >
              <span className="font-manrope font-medium text-white">
                {item.title}
              </span>
              <span className="text-lime text-xl">
                {openItem === index ? "−" : "+"}
              </span>
            </button>

            {openItem === index && (
              <div className="px-4 pb-4 border-t border-white/10 pt-3">
                <ol className="space-y-2 list-decimal list-inside">
                  {item.steps.map((step, stepIndex) => (
                    <li
                      key={stepIndex}
                      className="font-manrope text-sm"
                      style={{ color: "var(--color-text-muted)" }}
                    >
                      {step}
                    </li>
                  ))}
                </ol>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
