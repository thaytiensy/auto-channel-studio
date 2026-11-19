import { NextResponse } from "next/server";
import { z } from "zod";
import { SceneSchema } from "@/schemas";
import { getRepository } from "@/lib/storage";

interface RouteContext {
  params: Promise<{ projectId: string }>;
}

export async function GET(
  _req: Request,
  context: RouteContext
): Promise<NextResponse> {
  const { projectId } = await context.params;

  if (!projectId || !/^[a-zA-Z0-9_-]+$/.test(projectId)) {
    return NextResponse.json(
      { error: "Định dạng projectId không hợp lệ" },
      { status: 400 }
    );
  }

  const repo = getRepository();
  const project = await repo.projects.getById(projectId);

  if (!project) {
    return NextResponse.json(
      { error: `Không tìm thấy dự án với ID: ${projectId}` },
      { status: 404 }
    );
  }

  return NextResponse.json({ project });
}

const PatchBodySchema = z.object({
  scenes: z.array(SceneSchema).min(1),
});

export async function PATCH(
  req: Request,
  context: RouteContext
): Promise<NextResponse> {
  const { projectId } = await context.params;

  if (!projectId || !/^[a-zA-Z0-9_-]+$/.test(projectId)) {
    return NextResponse.json(
      { error: "Định dạng projectId không hợp lệ" },
      { status: 400 }
    );
  }

  try {
    const rawBody: unknown = await req.json();
    const { scenes } = PatchBodySchema.parse(rawBody);

    const repo = getRepository();
    const existing = await repo.projects.getById(projectId);

    if (!existing) {
      return NextResponse.json(
        { error: `Không tìm thấy dự án với ID: ${projectId}` },
        { status: 404 }
      );
    }

    const updated = await repo.projects.update({
      ...existing,
      scenes,
      updatedAt: new Date().toISOString(),
    });

    return NextResponse.json({ project: updated });
  } catch (err: unknown) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: err.issues },
        { status: 400 }
      );
    }
    const message =
      err instanceof Error ? err.message : "Cập nhật dự án thất bại";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
