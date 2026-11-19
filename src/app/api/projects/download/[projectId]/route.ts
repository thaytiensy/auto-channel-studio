import fs from "node:fs";
import path from "node:path";
import { NextResponse } from "next/server";
import { getWorkerTmpDir } from "@/lib/storage/paths";

interface RouteContext {
  params: Promise<{ projectId: string }>;
}

export async function GET(
  request: Request,
  context: RouteContext
): Promise<Response> {
  const { projectId } = await context.params;

  if (!projectId || !/^[a-zA-Z0-9_-]+$/.test(projectId)) {
    return NextResponse.json(
      { error: "Định dạng projectId không hợp lệ" },
      { status: 400 }
    );
  }

  const filePath = path.join(
    getWorkerTmpDir(),
    `${projectId}_final.mp4`
  );

  if (!fs.existsSync(filePath)) {
    return NextResponse.json(
      { error: "Video hoàn chỉnh chưa được render hoặc không tồn tại." },
      { status: 404 }
    );
  }

  let stat: fs.Stats;
  try {
    stat = await fs.promises.stat(filePath);
  } catch {
    return NextResponse.json({ error: "Không thể đọc thông tin file." }, { status: 500 });
  }

  const rangeHeader = request.headers.get("range");

  // ── Partial Content (HTTP 206) ──────────────────────────────────────────
  if (rangeHeader) {
    const match = /^bytes=(\d*)-(\d*)$/.exec(rangeHeader);
    if (!match) {
      return new Response(null, {
        status: 416,
        headers: { "Content-Range": `bytes */${stat.size}` },
      });
    }

    const fileSize = stat.size;
    const rawStart = match[1] ? parseInt(match[1], 10) : 0;
    const rawEnd = match[2] ? parseInt(match[2], 10) : fileSize - 1;
    const start = rawStart;
    const end = Math.min(rawEnd, fileSize - 1);
    const chunkSize = end - start + 1;

    if (start > end || start >= fileSize) {
      return new Response(null, {
        status: 416,
        headers: { "Content-Range": `bytes */${fileSize}` },
      });
    }

    let fileHandle: fs.promises.FileHandle | null = null;
    try {
      fileHandle = await fs.promises.open(filePath, "r");
      const buf = Buffer.alloc(chunkSize);
      await fileHandle.read(buf, 0, chunkSize, start);
      return new Response(new Uint8Array(buf), {
        status: 206,
        headers: {
          "Content-Type": "video/mp4",
          "Content-Range": `bytes ${start}-${end}/${fileSize}`,
          "Accept-Ranges": "bytes",
          "Content-Length": String(chunkSize),
          "Content-Disposition": `inline; filename="${projectId}_final.mp4"`,
        },
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Lỗi đọc chunk";
      return NextResponse.json({ error: msg }, { status: 500 });
    } finally {
      if (fileHandle) await fileHandle.close().catch(() => null);
    }
  }

  // ── Full Content (HTTP 200) ─────────────────────────────────────────────
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
    const message = err instanceof Error ? err.message : "Lỗi khi đọc file video";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
