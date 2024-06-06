import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Image from "next/image";
import Link from "next/link";
import { VercelToolbar } from "@vercel/toolbar/next";

const inter = Inter({ subsets: ["latin"] });

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
    <html lang="en">
      <head>
        <meta property="og:image" content="<generated>" />
        <meta property="og:image:alt" content="F1 Stats" />
        <meta property="og:image:type" content="image/png" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:site_name" content="F1" />
        <meta property="og:url" content="https://f1.edselserrano.com/" />
      </head>
      <body
        className={
          inter.className +
          " flex min-h-screen flex-col items-center justify-between p-4"
        }
      >
        <section className="flex flex-col items-center">
          <div>
            <Link href={"/"}>
              <Image
                src="/f1logo.png"
                alt="Logo"
                width={300}
                height={150}
                priority
              />
            </Link>
          </div>
          <span className="text-black">
            First version of F1 stats, that you can only see the races from
            2024.
          </span>
        </section>

        <main className="m-5 w-full h-screen">{children}</main>
        <footer className="fixed bottom-0  text-black">
          <p>Powered by @pretxelcom v1.0.0</p>
        </footer>
        {shouldInjectToolbar && <VercelToolbar />}
      </body>
    </html>
  );
}
