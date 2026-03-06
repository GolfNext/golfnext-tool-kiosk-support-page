import type { Translations } from "@/lib/locale-types";

interface ClubContactProps {
  translations: Translations;
}

export function ClubContact({ translations }: ClubContactProps) {
  // Build club items dynamically from translations
  const itemCount = parseInt(translations["club.items.count"] || "0");
  const items: string[] = [];

  for (let i = 1; i <= itemCount; i++) {
    const item = translations[`club.item.${i}`];
    if (item) items.push(item);
  }

  if (items.length === 0) {
    return null;
  }

  return (
    <section className="w-full max-w-[480px] mx-auto px-4 py-6">
      <div
        className="p-6 rounded-lg border border-neutral/20"
        style={{ backgroundColor: "var(--color-card-bg)" }}
      >
        <h2 className="text-lg font-sora font-semibold text-white mb-3">
          {translations["club.section.title"] ||
            "What GolfNext cannot help with – contact the club"}
        </h2>
        <p className="text-sm font-manrope mb-4 text-neutral">
          {translations["club.section.description"] ||
            "For the following questions, please contact your golf club directly:"}
        </p>
        <ul className="space-y-2 mb-4">
          {items.map((item, index) => (
            <li
              key={index}
              className="flex items-start gap-2 font-manrope text-sm text-white"
            >
              <span className="text-lime mt-0.5">•</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
        <p className="text-sm font-manrope text-neutral">
          {translations["club.find_club"] || "Find your club at golfnext.com/clubs"}
        </p>
      </div>
    </section>
  );
}
