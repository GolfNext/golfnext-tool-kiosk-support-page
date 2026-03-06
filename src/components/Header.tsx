import Image from "next/image";
import { LanguageSwitcher } from "./LanguageSwitcher";
import type { Translations } from "@/lib/locale-types";
import type { Locale } from "@/lib/locale-types";

interface HeaderProps {
  translations: Translations;
  onLanguageChange: (locale: Locale) => void;
}

export function Header({ translations, onLanguageChange }: HeaderProps) {
  return (
    <header className="w-full bg-midnight-green border-b border-white/10">
      <div className="max-w-[480px] mx-auto px-4 py-4 flex items-center justify-between">
        <Image
          src="/Logo/Horizontal/PNG/Horizontal Logo Light Green.png"
          alt="GolfNext"
          width={150}
          height={50}
          className="h-10 w-auto"
          priority
        />
        <LanguageSwitcher
          translations={translations}
          onLanguageChange={onLanguageChange}
        />
      </div>
    </header>
  );
}
