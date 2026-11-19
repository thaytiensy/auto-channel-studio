import { z } from "zod";

export const ChannelProfileSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  niche: z.string().min(1),
  brandVoice: z.string().min(1),
  bannedWords: z.array(z.string()),
  pastTopics: z.array(z.string()),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type ChannelProfile = z.infer<typeof ChannelProfileSchema>;
