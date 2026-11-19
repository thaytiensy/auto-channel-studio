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

export interface ProjectOperations {
  list(channelId?: string): Promise<ProjectManifest[]>;
  getById(projectId: string): Promise<ProjectManifest | null>;
  create(project: ProjectManifest): Promise<ProjectManifest>;
  update(project: ProjectManifest): Promise<ProjectManifest>;
}

export interface AppRepository {
  channels: ChannelOperations;
  projects: ProjectOperations;

  // Legacy direct methods (kept for backward compat)
  listChannels(): Promise<ChannelProfile[]>;
  getChannel(id: string): Promise<ChannelProfile | null>;
  saveChannel(channel: ChannelProfile): Promise<ChannelProfile>;

  listProjects(channelId?: string): Promise<ProjectManifest[]>;
  getProject(projectId: string): Promise<ProjectManifest | null>;
  saveProject(project: ProjectManifest): Promise<ProjectManifest>;

  getAsset(assetId: string): Promise<AssetRecord | null>;
  saveAsset(asset: AssetRecord): Promise<AssetRecord>;
  listAssets(): Promise<AssetRecord[]>;

  getJob(jobId: string): Promise<JobRecord | null>;
  getJobByIdempotencyKey(key: string): Promise<JobRecord | null>;
  saveJob(job: JobRecord): Promise<JobRecord>;

  appendLedgerEntry(entry: CreditLedgerEntry): Promise<CreditLedgerEntry>;
  listLedgerEntries(projectId?: string): Promise<CreditLedgerEntry[]>;
  getTotalSpentCents(projectId: string): Promise<number>;
}
