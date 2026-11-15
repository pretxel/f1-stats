import { ImageResponse } from "next/og";

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
          background: "#DADDD8",
          color: "#12324A",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 30, color: "#46596A" }}>
          <span>{countryName}</span>
          <span>F1 Stats</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", fontSize: 120, fontWeight: 800, lineHeight: 1, letterSpacing: "-0.03em" }}>
            {circuitName}
          </div>
          <div style={{ display: "flex", marginTop: 20, fontSize: 40, color: "#46596A" }}>
            {[sessionType, dateStr].filter(Boolean).join(", ")}
          </div>
          <div style={{ display: "flex", marginTop: 40, height: 14, background: "#12324A" }} />
        </div>
      </div>
    ),
    { ...size }
  );
}
