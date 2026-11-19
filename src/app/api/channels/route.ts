import { NextResponse } from "next/server";
import { z } from "zod";
import { ChannelProfileSchema } from "@/schemas";
import { getRepository } from "@/lib/storage";

const CreateChannelInputSchema = ChannelProfileSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  pastTopics: z.array(z.string()).default([]),
});

export type CreateChannelInput = z.infer<typeof CreateChannelInputSchema>;

export async function GET(): Promise<NextResponse> {
  try {
    const repo = getRepository();
    const channels = await repo.channels.list();
    return NextResponse.json({ channels }, { status: 200 });
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Failed to fetch channels";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: Request): Promise<NextResponse> {
  try {
    const rawBody: unknown = await req.json();
    const validated = CreateChannelInputSchema.parse(rawBody);

    const repo = getRepository();
    const created = await repo.channels.create(validated);

    return NextResponse.json({ channel: created }, { status: 201 });
  } catch (err: unknown) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: err.issues },
        { status: 400 }
      );
    }
    const message =
      err instanceof Error ? err.message : "Failed to create channel";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
