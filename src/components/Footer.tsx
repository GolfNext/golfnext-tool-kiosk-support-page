import Image from "next/image";
import type { Translations } from "@/lib/locale-types";

interface FooterProps {
  translations: Translations;
}

export function Footer({ translations }: FooterProps) {
  return (
    <footer className="w-full max-w-[480px] mx-auto px-4 py-8 mt-12 border-t border-white/10">
      <div className="flex flex-col items-center gap-4">
        <Image
          src="/Logo/Icon/PNG/Logo Icon Light Green.png"
          alt="GolfNext"
          width={48}
          height={48}
          className="h-12 w-12 opacity-60"
        />
        <a
          href="https://147800609.hs-sites-eu1.com/about"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-manrope text-neutral hover:text-lime transition-colors"
        >
          {translations["about.link_label"] || "About GolfNext"}
        </a>
        <p className="text-xs font-manrope text-neutral/60">
          © {new Date().getFullYear()} GolfNext
        </p>
      </div>
    </footer>
  );
}
