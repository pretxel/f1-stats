import type { Metadata } from "next";
import { Barlow_Condensed, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Image from "next/image";
import Link from "next/link";
import { VercelToolbar } from "@vercel/toolbar/next";
import { currentYear } from "@/utils/constants";

const barlow = Barlow_Condensed({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  style: ["normal", "italic"],
  variable: "--font-barlow",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "F1 stats",
  description: "F1 stats",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const shouldInjectToolbar = process.env.NODE_ENV === "development";
  return (
    <html lang="en" className={`${barlow.variable} ${jetbrainsMono.variable}`}>
      <head>
        <meta property="og:image" content="<generated>" />
        <meta property="og:image:alt" content="F1 Stats" />
        <meta property="og:image:type" content="image/png" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:site_name" content="F1" />
        <meta property="og:url" content="https://f1.edselserrano.com/" />
      </head>
      <body className="font-display flex min-h-screen flex-col bg-carbon">
        {/* Header */}
        <header className="relative z-10 w-full border-b border-carbon-border bg-carbon-light">
          <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-4 group">
              <div className="relative">
                <div className="absolute -inset-1 bg-f1red opacity-0 group-hover:opacity-10 transition-opacity duration-300 rounded" />
                <Image
                  src="/f1logo.png"
                  alt="F1"
                  width={80}
                  height={40}
                  priority
                  className="object-contain"
                />
              </div>
            </Link>
            <div className="flex items-center gap-3">
              <span className="font-data text-[10px] tracking-[0.3em] uppercase text-muted">
                Season
              </span>
              <span className="font-data text-sm font-bold text-f1red tracking-widest">
                {currentYear}
              </span>
            </div>
          </div>
          {/* Red stripe accent */}
          <div className="h-[2px] w-full bg-gradient-to-r from-f1red via-f1red-dark to-transparent" />
        </header>

        {/* Subheading */}
        <div className="relative z-10 border-b border-carbon-border bg-carbon px-6 py-2">
          <div className="mx-auto max-w-7xl">
            <p className="font-data text-[11px] text-muted tracking-widest uppercase">
              Session data · {currentYear} Formula 1 World Championship
            </p>
          </div>
        </div>

        <main className="relative z-10 flex-1 mx-auto w-full max-w-7xl px-6 py-8">
          {children}
        </main>

        <footer className="relative z-10 border-t border-carbon-border bg-carbon-light mt-16">
          <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
            <span className="font-data text-[10px] text-muted tracking-[0.2em] uppercase">
              @pretxelcom
            </span>
            <span className="font-data text-[10px] text-muted-dark tracking-widest">
              v1.0.0
            </span>
          </div>
        </footer>

        {shouldInjectToolbar && <VercelToolbar />}
      </body>
    </html>
  );
}
