# SEO & Accessibility Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix all SEO and Accessibility issues identified in IMPROVEMENTS.md sections 6 and 7.

**Architecture:** Metadata is spread across `layout.tsx` (global) and session `layout.tsx` (static). We move session metadata to `page.tsx` so it can be data-driven, add JSON-LD structured data, generate `robots.ts` / `sitemap.ts` via Next.js App Router handlers, style both OG images with the carbon dark theme, and add three ARIA attributes to interactive components.

**Tech Stack:** Next.js 16 App Router, TypeScript strict, `@/services/races` (existing), `next/og` ImageResponse (existing), Tailwind (components only — OG images use inline styles).

---

## Branch

All changes go on the existing `improvements` branch (already created from `main`).

---

## Pre-flight observations

- **7.2 is already fixed** — `tabs.tsx` has `<label htmlFor="tabs" className="sr-only">` correctly paired with `<select id="tabs">`. No work needed.
- **7.3 (yearSelector)** — `yearSelector.tsx` does not exist on the `improvements` branch (lives only on `feat/year-selector`). Skipped.
- **Active issues:** 6.1, 6.2, 6.3, 6.4, 7.1.

---

## File Map

| Action | File | What changes |
|---|---|---|
| Modify | `src/app/layout.tsx` | Update global `metadata` title + description (lines 22-25) |
| Modify | `src/app/session/[id]/layout.tsx` | Remove static `metadata` export |
| Modify | `src/app/session/[id]/page.tsx` | Add `generateMetadata` + JSON-LD `<script>` block |
| Create | `src/app/robots.ts` | Next.js robots.txt handler |
| Create | `src/app/sitemap.ts` | Next.js sitemap.xml handler |
| Modify | `src/app/opengraph-image.tsx` | Replace white/plain with carbon dark theme |
| Modify | `src/app/session/[id]/opengraph-image.tsx` | Fetch session data + styled card |
| Modify | `src/components/liveItem.tsx` | Wrap in `aria-live="polite"` div |

---

## Task 1 — Global metadata (SEO 6.1)

**Files:**
- Modify: `src/app/layout.tsx:22-25`

- [ ] **Step 1: Update metadata in layout.tsx**

Replace:
```ts
export const metadata: Metadata = {
  title: "F1 stats",
  description: "F1 stats",
};
```

With:
```ts
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
  },
};
```

- [ ] **Step 2: Verify**

Run `pnpm dev` and open `http://localhost:3000`. Inspect `<head>` — `<title>` should read `F1 Stats — Formula 1 Session Data`.

- [ ] **Step 3: Commit**

```bash
git add src/app/layout.tsx
git commit -m "seo: improve global page title and meta description"
```

---

## Task 2 — Dynamic session metadata (SEO 6.1 / UX 1.6)

**Files:**
- Modify: `src/app/session/[id]/layout.tsx:4-8` — remove static export
- Modify: `src/app/session/[id]/page.tsx` — add `generateMetadata`

- [ ] **Step 1: Remove static metadata from session layout**

In `src/app/session/[id]/layout.tsx`, delete the static metadata block and the `Metadata` import:

```ts
import type { Metadata } from "next";
import Tabs from "@/components/tabs";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Session F1",
  description: "Session F1",
};
```

Replace the entire file with:

```ts
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
```

- [ ] **Step 2: Add generateMetadata to session page**

In `src/app/session/[id]/page.tsx`, add the following imports and `generateMetadata` function **before** the `Session` component:

```ts
import type { Metadata } from "next";
```

Add this function after the imports block (before the `Tabs` constant):

```ts
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  try {
    const race = await getRaces({ sessionKey: id });
    if (!race || race.length === 0) {
      return { title: "Session — F1 Stats" };
    }
    const s = race[0];
    const title = `${s.circuit_short_name} ${s.session_type} — F1 Stats`;
    const description = `${s.session_type} at ${s.circuit_short_name}, ${s.country_name}. Session data including race control events and pit stop analysis.`;
    return {
      title,
      description,
      openGraph: {
        title,
        description,
        type: "website",
      },
    };
  } catch {
    return { title: "Session — F1 Stats" };
  }
}
```

The final `src/app/session/[id]/page.tsx` should look like:

```ts
import type { Metadata } from "next";
import React, { Suspense } from "react";
import RaceControl from "@/components/raceControl";
import PitStops from "@/components/pitstops";
import { getRaces } from "@/services/races";
import LiveItem from "@/components/liveItem";
import isLiveSessionNow from "@/utils/isLiveSessionNow";

interface TabJSXElement {
  [key: number]: React.JSX.Element;
}
const Tabs = (sessionKey: string, liveMode: boolean): TabJSXElement => ({
  1: <RaceControl session_key={sessionKey} liveMode={liveMode} />,
  2: <PitStops session_key={sessionKey} liveMode={liveMode} />,
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  try {
    const race = await getRaces({ sessionKey: id });
    if (!race || race.length === 0) {
      return { title: "Session — F1 Stats" };
    }
    const s = race[0];
    const title = `${s.circuit_short_name} ${s.session_type} — F1 Stats`;
    const description = `${s.session_type} at ${s.circuit_short_name}, ${s.country_name}. Session data including race control events and pit stop analysis.`;
    return {
      title,
      description,
      openGraph: {
        title,
        description,
        type: "website",
      },
    };
  } catch {
    return { title: "Session — F1 Stats" };
  }
}

export default async function Session({ params, searchParams }: any) {
  const paramsAwaited = await params;
  const searchParamsAwaited = await searchParams;

  const selectedTab = searchParamsAwaited?.selectedTab
    ? parseInt(searchParamsAwaited?.selectedTab as string)
    : 1;
  const idSession = paramsAwaited.id;
  const race = await getRaces({ sessionKey: idSession });
  const isLiveMode = isLiveSessionNow(
    new Date(race[0].date_start),
    new Date(race[0].date_end)
  );

  return (
    <section>
      {isLiveMode && (
        <div className="mb-6">
          <LiveItem isLiveFetching={true} />
        </div>
      )}

      <Suspense
        fallback={
          <div className="space-y-3">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="h-12 bg-carbon-light border-l-[3px] border-carbon-border animate-pulse"
              />
            ))}
          </div>
        }
      >
        {Tabs(idSession, isLiveMode)[selectedTab]}
      </Suspense>
    </section>
  );
}
```

- [ ] **Step 3: Verify**

Run `pnpm dev`, navigate to a session detail page (e.g. `/session/9158`). Check `<title>` in DevTools — should read something like `Bahrain Race — F1 Stats`.

- [ ] **Step 4: Commit**

```bash
git add src/app/session/[id]/layout.tsx src/app/session/[id]/page.tsx
git commit -m "seo: dynamic session page title and description from session data"
```

---

## Task 3 — JSON-LD structured data (SEO 6.2)

**Files:**
- Modify: `src/app/session/[id]/page.tsx` — inject JSON-LD block inside `Session` component

- [ ] **Step 1: Add JSON-LD to the Session component**

Inside the `Session` component's return, add a `<script type="application/ld+json">` block immediately after the opening `<section>` tag (before the `{isLiveMode && ...}` block):

The full updated `return` in the `Session` function:

```tsx
  return (
    <section>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SportsEvent",
            name: `${race[0].circuit_short_name} ${race[0].session_type}`,
            sport: "Formula One",
            startDate: new Date(race[0].date_start).toISOString(),
            endDate: new Date(race[0].date_end).toISOString(),
            location: {
              "@type": "Place",
              name: race[0].circuit_short_name,
              address: {
                "@type": "PostalAddress",
                addressCountry: race[0].country_code,
                addressLocality: race[0].location,
              },
            },
            eventStatus: "https://schema.org/EventScheduled",
          }),
        }}
      />
      {isLiveMode && (
        <div className="mb-6">
          <LiveItem isLiveFetching={true} />
        </div>
      )}

      <Suspense
        fallback={
          <div className="space-y-3">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="h-12 bg-carbon-light border-l-[3px] border-carbon-border animate-pulse"
              />
            ))}
          </div>
        }
      >
        {Tabs(idSession, isLiveMode)[selectedTab]}
      </Suspense>
    </section>
  );
```

- [ ] **Step 2: Verify**

In DevTools → Elements, search for `application/ld+json`. The script should contain valid JSON with `@type: SportsEvent`, `startDate`, `endDate`, and `location`.

Optionally paste the JSON into [Google's Rich Results Test](https://search.google.com/test/rich-results).

- [ ] **Step 3: Commit**

```bash
git add src/app/session/[id]/page.tsx
git commit -m "seo: add JSON-LD SportsEvent structured data to session pages"
```

---

## Task 4 — robots.ts (SEO 6.3)

**Files:**
- Create: `src/app/robots.ts`

- [ ] **Step 1: Create robots.ts**

```ts
// src/app/robots.ts
import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: "/.well-known/vercel/flags",
    },
    sitemap: "https://f1.edselserrano.com/sitemap.xml",
  };
}
```

- [ ] **Step 2: Verify**

Run `pnpm dev`, open `http://localhost:3000/robots.txt`. Should return:
```
User-Agent: *
Allow: /
Disallow: /.well-known/vercel/flags

Sitemap: https://f1.edselserrano.com/sitemap.xml
```

- [ ] **Step 3: Commit**

```bash
git add src/app/robots.ts
git commit -m "seo: add robots.txt via Next.js App Router handler"
```

---

## Task 5 — sitemap.ts (SEO 6.3)

**Files:**
- Create: `src/app/sitemap.ts`

- [ ] **Step 1: Create sitemap.ts**

```ts
// src/app/sitemap.ts
import type { MetadataRoute } from "next";
import { getRaces } from "@/services/races";

const BASE_URL = "https://f1.edselserrano.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  let sessions: Array<{ session_key: string; date_start: Date }> = [];

  try {
    sessions = await getRaces({});
  } catch {
    // If the API is unavailable at build time, fall back to home page only
    sessions = [];
  }

  const sessionEntries: MetadataRoute.Sitemap = sessions.map((s) => ({
    url: `${BASE_URL}/session/${s.session_key}`,
    lastModified: new Date(s.date_start),
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  return [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    ...sessionEntries,
  ];
}
```

- [ ] **Step 2: Verify**

Run `pnpm dev`, open `http://localhost:3000/sitemap.xml`. Should return XML with `<loc>https://f1.edselserrano.com</loc>` and one `<url>` entry per session.

- [ ] **Step 3: Commit**

```bash
git add src/app/sitemap.ts
git commit -m "seo: add sitemap.xml via Next.js App Router handler"
```

---

## Task 6 — Home OG image (SEO 6.4)

**Files:**
- Modify: `src/app/opengraph-image.tsx`

- [ ] **Step 1: Replace with styled carbon-theme OG image**

```tsx
// src/app/opengraph-image.tsx
import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt = "F1 Stats — Formula 1 Session Data";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#0C0C0E",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          padding: "64px",
          position: "relative",
        }}
      >
        {/* Red top stripe */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "6px",
            background: "#E10600",
          }}
        />
        {/* Left red accent */}
        <div
          style={{
            position: "absolute",
            top: "80px",
            left: 0,
            bottom: "80px",
            width: "4px",
            background: "#E10600",
          }}
        />
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "16px",
            paddingLeft: "24px",
          }}
        >
          <div
            style={{
              fontSize: "18px",
              letterSpacing: "0.4em",
              textTransform: "uppercase",
              color: "#8B8B9A",
              fontFamily: "monospace",
            }}
          >
            FORMULA 1
          </div>
          <div
            style={{
              fontSize: "88px",
              fontWeight: 800,
              color: "#F0F0F0",
              lineHeight: 1,
              letterSpacing: "-0.02em",
              fontFamily: "sans-serif",
            }}
          >
            F1 Stats
          </div>
          <div
            style={{
              fontSize: "28px",
              color: "#8B8B9A",
              fontFamily: "monospace",
              letterSpacing: "0.05em",
            }}
          >
            Race control · Pit stops · Live sessions
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
```

- [ ] **Step 2: Verify**

Run `pnpm dev`, open `http://localhost:3000/opengraph-image`. Should show a dark carbon background with white "F1 Stats" title and red accent stripe.

- [ ] **Step 3: Commit**

```bash
git add src/app/opengraph-image.tsx
git commit -m "seo: style home OG image with F1 carbon dark theme"
```

---

## Task 7 — Session OG image (UX 1.5 / SEO context)

**Files:**
- Modify: `src/app/session/[id]/opengraph-image.tsx`

- [ ] **Step 1: Update session OG image to fetch and display session data**

```tsx
// src/app/session/[id]/opengraph-image.tsx
import { ImageResponse } from "next/og";
import { getRaces } from "@/services/races";

export const runtime = "edge";

export const alt = "F1 Stats — Session Detail";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let circuitName = "F1 Session";
  let countryName = "";
  let sessionType = "";
  let dateStr = "";

  try {
    const races = await getRaces({ sessionKey: id });
    if (races && races.length > 0) {
      const s = races[0];
      circuitName = s.circuit_short_name ?? circuitName;
      countryName = s.country_name ?? "";
      sessionType = s.session_type ?? "";
      dateStr = s.date_start
        ? new Date(s.date_start).toLocaleDateString("en-GB", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })
        : "";
    }
  } catch {
    // silently fall back to defaults
  }

  return new ImageResponse(
    (
      <div
        style={{
          background: "#0C0C0E",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          padding: "64px",
          position: "relative",
        }}
      >
        {/* Red top stripe */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "6px",
            background: "#E10600",
          }}
        />
        {/* Left accent */}
        <div
          style={{
            position: "absolute",
            top: "80px",
            left: 0,
            bottom: "80px",
            width: "4px",
            background: "#E10600",
          }}
        />
        {/* Session type badge */}
        {sessionType && (
          <div
            style={{
              position: "absolute",
              top: "64px",
              right: "64px",
              background: "#1C1C22",
              border: "1px solid #2A2A32",
              padding: "8px 20px",
              fontSize: "16px",
              letterSpacing: "0.3em",
              textTransform: "uppercase",
              color: "#8B8B9A",
              fontFamily: "monospace",
              display: "flex",
            }}
          >
            {sessionType}
          </div>
        )}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "16px",
            paddingLeft: "24px",
          }}
        >
          {countryName && (
            <div
              style={{
                fontSize: "18px",
                letterSpacing: "0.4em",
                textTransform: "uppercase",
                color: "#8B8B9A",
                fontFamily: "monospace",
              }}
            >
              {countryName}
            </div>
          )}
          <div
            style={{
              fontSize: "80px",
              fontWeight: 800,
              color: "#F0F0F0",
              lineHeight: 1,
              letterSpacing: "-0.02em",
              fontFamily: "sans-serif",
            }}
          >
            {circuitName}
          </div>
          {dateStr && (
            <div
              style={{
                fontSize: "24px",
                color: "#8B8B9A",
                fontFamily: "monospace",
                letterSpacing: "0.05em",
              }}
            >
              {dateStr}
            </div>
          )}
        </div>
      </div>
    ),
    { ...size }
  );
}
```

- [ ] **Step 2: Verify**

Run `pnpm dev`, open `http://localhost:3000/session/9158/opengraph-image` (replace `9158` with a real session key). Should show a dark card with circuit name, country, session type badge, and date.

- [ ] **Step 3: Commit**

```bash
git add src/app/session/[id]/opengraph-image.tsx
git commit -m "seo: style session OG image with circuit name, session type, and date"
```

---

## Task 8 — aria-live on LiveItem (A11y 7.1)

**Files:**
- Modify: `src/components/liveItem.tsx`

- [ ] **Step 1: Wrap LiveItem return in aria-live region**

Replace the current `return` in `src/components/liveItem.tsx`:

```tsx
  return (
    <div className="flex items-center gap-1.5">
      <span className="relative flex h-2 w-2 flex-none">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-f1red opacity-75" />
        <span className="relative inline-flex rounded-full h-2 w-2 bg-f1red" />
      </span>
      <span className="font-data text-[10px] font-bold tracking-[0.25em] uppercase text-f1red">
        LIVE
      </span>
    </div>
  );
```

With:

```tsx
  return (
    <div aria-live="polite" aria-atomic="true">
      <div className="flex items-center gap-1.5">
        <span className="relative flex h-2 w-2 flex-none">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-f1red opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-f1red" />
        </span>
        <span className="font-data text-[10px] font-bold tracking-[0.25em] uppercase text-f1red">
          LIVE
        </span>
      </div>
    </div>
  );
```

- [ ] **Step 2: Verify**

Run `pnpm dev`, navigate to a session detail page for a live session (or temporarily force `isLiveMode = true` in the page component during local testing). Use a screen reader or browser accessibility inspector to confirm the live region is announced.

Alternatively, inspect the DOM — `<div aria-live="polite" aria-atomic="true">` should wrap the badge.

- [ ] **Step 3: Commit**

```bash
git add src/components/liveItem.tsx
git commit -m "a11y: wrap live session badge in aria-live polite region"
```

---

## Task 9 — Final push

- [ ] **Step 1: Run lint and tests**

```bash
pnpm lint && pnpm test
```

Expected: No lint errors. All existing tests pass (no tests were written against these files).

- [ ] **Step 2: Push to remote**

```bash
git push origin improvements
```

---

## Self-Review

### Spec coverage check

| Issue | Task | Status |
|---|---|---|
| 6.1 Generic title/description | Task 1 (global) + Task 2 (session dynamic) | Covered |
| 6.2 No JSON-LD | Task 3 | Covered |
| 6.3 No robots.txt / sitemap.xml | Task 4 + Task 5 | Covered |
| 6.4 OG image not customized | Task 6 (home) + Task 7 (session) | Covered |
| 7.1 No aria-live | Task 8 | Covered |
| 7.2 Select without label | Pre-flight: already implemented | N/A |
| 7.3 yearSelector aria-pressed | Pre-flight: component absent on this branch | Skipped |

### Type consistency

- `generateMetadata` in Task 2 uses `race[0].circuit_short_name`, `race[0].session_type`, `race[0].country_name`, `race[0].date_start` — all defined in `src/types/RaceItemType.ts` ✓
- `sitemap.ts` accesses `s.session_key` and `s.date_start` — both on `RaceItemType` ✓
- Session OG image accesses `races[0].circuit_short_name`, `.country_name`, `.session_type`, `.date_start` — all on `RaceItemType` ✓

### Placeholder scan

No TBD, TODO, or incomplete sections detected. All code blocks are complete.
