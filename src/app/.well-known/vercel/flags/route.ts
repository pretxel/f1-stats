import { type NextRequest, NextResponse } from "next/server";
import { type ApiData, verifyAccess } from "@vercel/flags";

export async function GET(request: NextRequest) {
  const access = await verifyAccess(request.headers.get("Authorization"));
  if (!access) return NextResponse.json(null, { status: 401 });

  return NextResponse.json<ApiData>({
    definitions: {},
  });
}
