import { NextResponse } from "next/server";
import { getRepository } from "@/lib/storage";

export async function GET(req: Request): Promise<NextResponse> {
  try {
    const url = new URL(req.url);
    const channelId = url.searchParams.get("channelId") ?? undefined;
    const repo = getRepository();
    const projects = await repo.projects.list(channelId);
    return NextResponse.json({ projects });
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Failed to list projects";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
