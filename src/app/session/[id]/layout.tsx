import Tabs from "@/components/tabs";
import { Suspense } from "react";

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
