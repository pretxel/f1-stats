import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt = "F1 stats";
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default async function Image({ params }: { params: { id: string } }) {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 128,
          background: "white",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        F1 Stats {params.id}
      </div>
    ),
    {
      ...size,
    }
  );
}
