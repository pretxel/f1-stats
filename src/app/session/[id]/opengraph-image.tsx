import { ImageResponse } from "next/og";

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
    const apiEndpoint = process.env.API_ENDPOINT;
    if (apiEndpoint) {
      const base = apiEndpoint.endsWith("/") ? apiEndpoint : `${apiEndpoint}/`;
      const res = await fetch(
        `${base}sessions?session_key=${id}`,
        { next: { revalidate: 3600 } }
      );
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          const s = data[0];
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
      }
    }
  } catch (err) {
    if (process.env.NODE_ENV !== "production") {
      console.error("[session/opengraph-image] Failed to fetch session data:", err);
    }
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
