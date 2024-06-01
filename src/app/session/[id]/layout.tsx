import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Tabs from "@/components/tabs";
const inter = Inter({ subsets: ["latin"] });
import { Suspense } from "react";
import Skeleton from "react-loading-skeleton";

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
      <Suspense fallback={<Skeleton count={1} />}>
        <Tabs />
      </Suspense>
      {children}
    </section>
  );
}
