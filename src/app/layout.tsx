import type { Metadata } from "next";
import { Sora, Manrope } from "next/font/google";
import "./globals.css";

const sora = Sora({
  subsets: ["latin"],
  variable: "--font-sora",
  display: "swap",
});

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
});

export const metadata: Metadata = {
  title: "GolfNext Hotline | Remote Help",
  description:
    "Get help with GolfNext machines - support for kiosks, driving range terminals, and simulators. Available 07:00-22:00 CET.",
  icons: {
    icon: "/Logo/Favicon/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>): React.ReactElement {
  return (
    <html lang="en" className={`${sora.variable} ${manrope.variable}`}>
      <body className="min-h-screen font-body antialiased" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
