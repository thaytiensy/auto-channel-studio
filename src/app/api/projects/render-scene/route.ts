import { NextResponse } from "next/server";
import { z } from "zod";

const RenderSceneInputSchema = z.object({
  sceneId: z.string().min(1),
  durationMs: z.number().positive(),
  audioPath: z.string().optional().default(""),
});

export type RenderSceneInput = z.infer<typeof RenderSceneInputSchema>;

export interface WorkerRenderResponse {
  status: "ok" | "error";
  videoPath?: string;
  usedSilentFallback?: boolean;
  message?: string;
}

export async function POST(req: Request): Promise<NextResponse> {
  try {
    const rawBody: unknown = await req.json();
    const validated = RenderSceneInputSchema.parse(rawBody);

    const workerUrl = process.env.WORKER_URL || "http://127.0.0.1:4001";

    let workerRes: Response;
    try {
      workerRes = await fetch(`${workerUrl}/render-scene`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
        signal: AbortSignal.timeout(30000),
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

    const data = (await workerRes.json()) as WorkerRenderResponse;

    if (!workerRes.ok || data.status !== "ok") {
      return NextResponse.json(
        { error: data.message || "Lỗi khi render video trong Worker" },
        { status: 500 }
      );
    }

    return NextResponse.json(data, { status: 200 });
  } catch (err: unknown) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Dữ liệu không hợp lệ", details: err.issues },
        { status: 400 }
      );
    }
    const message =
      err instanceof Error ? err.message : "Lỗi hệ thống khi xử lý render";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
