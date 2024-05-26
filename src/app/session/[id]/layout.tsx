import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Tabs from "@/components/tabs";
const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Session F1",
  description: "Session F1",
};

export default function SessionLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <section className={inter.className}>
      <Tabs />
      {children}
    </section>
  );
}
