import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: "#12324A",
          color: "#EEF0EC",
          fontSize: 17,
          fontWeight: 800,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        F1
        <div style={{ display: "flex", width: 22, height: 3, marginTop: 2 }}>
          <div style={{ flex: 1, background: "#1F8A4C" }} />
          <div style={{ flex: 1, background: "#F2C40F" }} />
          <div style={{ flex: 1, background: "#D7261E" }} />
        </div>
      </div>
    ),
    { ...size }
  );
}
