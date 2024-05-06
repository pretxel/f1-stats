import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Image from "next/image";

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
  return (
    <html
      lang="en"
      className="flex min-h-screen flex-col items-center justify-between p-4"
    >
      <body className={inter.className}>{children}</body>
    </html>
  );
}
