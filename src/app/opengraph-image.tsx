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
