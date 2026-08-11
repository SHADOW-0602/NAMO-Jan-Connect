import { env } from "cloudflare:workers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const key = request.nextUrl.searchParams.get("key");
  if (!key || !key.startsWith("complaints/") || !env.UPLOADS) return NextResponse.json({ error: "File not found" }, { status: 404 });
  const object = await env.UPLOADS.get(key);
  if (!object) return NextResponse.json({ error: "File not found" }, { status: 404 });
  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set("cache-control", "public, max-age=3600");
  headers.set("x-content-type-options", "nosniff");
  return new Response(object.body, { headers });
}

