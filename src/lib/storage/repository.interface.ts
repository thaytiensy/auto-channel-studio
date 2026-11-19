import type {
  ChannelProfile,
  ProjectManifest,
  AssetRecord,
  JobRecord,
  CreditLedgerEntry,
} from "@/schemas";

export type ChannelCreateInput = Omit<
  ChannelProfile,
  "id" | "createdAt" | "updatedAt"
>;

export interface ChannelOperations {
  list(): Promise<ChannelProfile[]>;
  get(id: string): Promise<ChannelProfile | null>;
  create(input: ChannelCreateInput): Promise<ChannelProfile>;
  save(channel: ChannelProfile): Promise<ChannelProfile>;
}

export interface AppRepository {
  // Direct channel operations
  channels: ChannelOperations;

  // Channels legacy / direct methods
  listChannels(): Promise<ChannelProfile[]>;
  getChannel(id: string): Promise<ChannelProfile | null>;
  saveChannel(channel: ChannelProfile): Promise<ChannelProfile>;

  // Projects
  listProjects(channelId?: string): Promise<ProjectManifest[]>;
  getProject(projectId: string): Promise<ProjectManifest | null>;
  saveProject(project: ProjectManifest): Promise<ProjectManifest>;

  // Assets
  getAsset(assetId: string): Promise<AssetRecord | null>;
  saveAsset(asset: AssetRecord): Promise<AssetRecord>;
  listAssets(): Promise<AssetRecord[]>;

  // Jobs (with idempotency checking)
  getJob(jobId: string): Promise<JobRecord | null>;
  getJobByIdempotencyKey(key: string): Promise<JobRecord | null>;
  saveJob(job: JobRecord): Promise<JobRecord>;

  // Ledger (append-only & spent sum)
  appendLedgerEntry(entry: CreditLedgerEntry): Promise<CreditLedgerEntry>;
  listLedgerEntries(projectId?: string): Promise<CreditLedgerEntry[]>;
  getTotalSpentCents(projectId: string): Promise<number>;
}
