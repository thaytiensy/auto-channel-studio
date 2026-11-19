import { NextResponse } from "next/server";
import { z } from "zod";
import { SceneSchema } from "@/schemas";

const RenderFullInputSchema = z.object({
  projectId: z.string().min(1),
  scenes: z.array(SceneSchema).min(1),
});

export type RenderFullInput = z.infer<typeof RenderFullInputSchema>;

interface WorkerProjectResponse {
  status: "ok" | "error";
  finalVideoPath?: string;
  totalScenes?: number;
  message?: string;
}

export async function POST(req: Request): Promise<NextResponse> {
  try {
    const rawBody: unknown = await req.json();
    const validated = RenderFullInputSchema.parse(rawBody);

    const workerUrl = process.env.WORKER_URL || "http://127.0.0.1:4001";

    let workerRes: Response;
    try {
      workerRes = await fetch(`${workerUrl}/render-project`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
        signal: AbortSignal.timeout(60000),
      });
    } catch {
      return NextResponse.json(
        {
          error:
            "Render Worker đang tắt. Hãy mở Terminal chạy lệnh: npm run worker",
        },
        { status: 503 }
      );
    }

    const data = (await workerRes.json()) as WorkerProjectResponse;

    if (!workerRes.ok || data.status !== "ok") {
      return NextResponse.json(
        { error: data.message || "Lỗi khi ghép video toàn bộ dự án" },
        { status: 500 }
      );
    }

    const downloadUrl = `/api/projects/download/${encodeURIComponent(
      validated.projectId
    )}`;

    return NextResponse.json(
      {
        status: "ok",
        downloadUrl,
        totalScenes: data.totalScenes ?? validated.scenes.length,
      },
      { status: 200 }
    );
  } catch (err: unknown) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Dữ liệu không hợp lệ", details: err.issues },
        { status: 400 }
      );
    }
    const message =
      err instanceof Error ? err.message : "Lỗi hệ thống khi nối video";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
