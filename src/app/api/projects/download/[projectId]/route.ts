import fs from "node:fs";
import path from "node:path";
import { NextResponse } from "next/server";

interface RouteContext {
  params: Promise<{ projectId: string }>;
}

export async function GET(
  _req: Request,
  context: RouteContext
): Promise<Response> {
  const { projectId } = await context.params;

  // Path traversal prevention: enforce alphanumeric, hyphen, underscore only
  if (!projectId || !/^[a-zA-Z0-9_-]+$/.test(projectId)) {
    return NextResponse.json(
      { error: "Định dạng projectId không hợp lệ" },
      { status: 400 }
    );
  }

  const filePath = path.join(
    process.cwd(),
    "worker",
    "tmp",
    `${projectId}_final.mp4`
  );

  if (!fs.existsSync(filePath)) {
    return NextResponse.json(
      {
        error:
          "Video hoàn chỉnh chưa được render hoặc không tồn tại. Vui lòng bấm Xuất Video trước.",
      },
      { status: 404 }
    );
  }

  try {
    const fileBuffer = await fs.promises.readFile(filePath);
    return new Response(new Uint8Array(fileBuffer), {
      status: 200,
      headers: {
        "Content-Type": "video/mp4",
        "Content-Length": String(fileBuffer.byteLength),
        "Content-Disposition": `inline; filename="${projectId}_final.mp4"`,
        "Accept-Ranges": "bytes",
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Lỗi khi đọc file video thành phẩm";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
