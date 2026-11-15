import type { Metadata, Viewport } from "next";
import { Archivo } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { VercelToolbar } from "@vercel/toolbar/next";

const archivo = Archivo({
  subsets: ["latin"],
  axes: ["wdth"],
  variable: "--font-archivo",
  display: "swap",
});

export const metadata: Metadata = {
  title: "F1 Stats — Formula 1 Session Data",
  description:
    "Race control timelines, pit stop durations, and live session tracking for every Formula 1 session.",
  openGraph: {
    type: "website",
    siteName: "F1 Stats",
    title: "F1 Stats — Formula 1 Session Data",
    description:
      "Race control timelines, pit stop durations, and live session tracking for every Formula 1 session.",
    url: "https://f1.edselserrano.com",
  },
};

export const viewport: Viewport = {
  themeColor: "#DADDD8",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const shouldInjectToolbar = process.env.NODE_ENV === "development";
  return (
    <html lang="en" className={archivo.variable}>
      <body className="flex min-h-screen flex-col bg-concrete font-sans text-ink">
        <header className="border-b-2 border-ink">
          <div className="mx-auto flex max-w-page items-baseline justify-between gap-4 px-4 py-4 sm:px-8">
            <Link
              href="/"
              className="wdth-expanded whitespace-nowrap text-xl font-extrabold tracking-tight"
            >
              F1 Stats
            </Link>
            <p className="hidden text-label text-ink-soft sm:block">
              Race control and pit stops for every session
            </p>
          </div>
        </header>

        <main className="mx-auto w-full max-w-page flex-1 px-4 py-8 sm:px-8">
          {children}
        </main>

        <footer className="border-t border-rule">
          <div className="mx-auto flex max-w-page flex-wrap justify-between gap-2 px-4 py-5 text-label text-ink-soft sm:px-8">
            <span>
              Data from{" "}
              <a
                href="https://openf1.org"
                className="underline decoration-rule underline-offset-4 hover:decoration-ink"
              >
                OpenF1
              </a>
              . Not affiliated with Formula 1.
            </span>
            <a
              href="https://x.com/pretxelcom"
              className="underline decoration-rule underline-offset-4 hover:decoration-ink"
            >
              @pretxelcom
            </a>
          </div>
        </footer>

        {shouldInjectToolbar && <VercelToolbar />}
      </body>
    </html>
  );
}
