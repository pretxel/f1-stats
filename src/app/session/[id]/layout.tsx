import type { Metadata } from "next";
import Tabs from "@/components/tabs";
import { Suspense } from "react";

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
    <section>
      <Suspense
        fallback={
          <div className="h-12 bg-carbon-mid border-b border-carbon-border animate-pulse" />
        }
      >
        <Tabs />
      </Suspense>
      {children}
    </section>
  );
}
