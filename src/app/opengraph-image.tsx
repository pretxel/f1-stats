import { ImageResponse } from "next/og";

export const alt = "F1 Stats — Formula 1 Session Data";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const FLAGS = ["#1F8A4C", "#1F8A4C", "#1F8A4C", "#E8892B", "#1F8A4C", "#D7261E", "#1F8A4C", "#1F8A4C"];

export default async function Image() {
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
        <div style={{ display: "flex", fontSize: 30, color: "#46596A" }}>
          Race control and pit stops for every Formula 1 session
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", fontSize: 140, fontWeight: 800, lineHeight: 1, letterSpacing: "-0.03em" }}>
            F1 Stats
          </div>
          <div style={{ display: "flex", marginTop: 40, height: 36, border: "3px solid #12324A" }}>
            {FLAGS.map((c, i) => (
              <div key={i} style={{ flex: i === 5 ? 0.6 : 1, background: c, borderRight: i < FLAGS.length - 1 ? "3px solid #12324A" : "none" }} />
            ))}
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
