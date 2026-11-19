import { z } from "zod";
import type {
  AppRepository,
  ChannelCreateInput,
  ChannelOperations,
} from "./repository.interface";
import { readJsonStore, writeJsonStore } from "./local-json-store";
import {
  ChannelProfileSchema,
  ProjectManifestSchema,
  AssetRecordSchema,
  JobRecordSchema,
  CreditLedgerEntrySchema,
  type ChannelProfile,
  type ProjectManifest,
  type AssetRecord,
  type JobRecord,
  type CreditLedgerEntry,
} from "@/schemas";

const ChannelsList = z.array(ChannelProfileSchema);
const ProjectsList = z.array(ProjectManifestSchema);
const AssetsList = z.array(AssetRecordSchema);
const JobsList = z.array(JobRecordSchema);
const LedgerList = z.array(CreditLedgerEntrySchema);

export class LocalJsonRepository implements AppRepository {
  readonly channels: ChannelOperations = {
    list: () => this.listChannels(),
    get: (id: string) => this.getChannel(id),
    create: async (input: ChannelCreateInput): Promise<ChannelProfile> => {
      const now = new Date().toISOString();
      const channel: ChannelProfile = {
        ...input,
        id: crypto.randomUUID(),
        pastTopics: input.pastTopics ?? [],
        createdAt: now,
        updatedAt: now,
      };
      return this.saveChannel(channel);
    },
    save: (channel: ChannelProfile) => this.saveChannel(channel),
  };

  async listChannels(): Promise<ChannelProfile[]> {
    return readJsonStore("channels.json", ChannelsList, []);
  }

  async getChannel(id: string): Promise<ChannelProfile | null> {
    const list = await this.listChannels();
    return list.find((c) => c.id === id) ?? null;
  }

  async saveChannel(channel: ChannelProfile): Promise<ChannelProfile> {
    const list = await this.listChannels();
    const idx = list.findIndex((c) => c.id === channel.id);
    if (idx >= 0) list[idx] = channel;
    else list.push(channel);
    await writeJsonStore("channels.json", list, ChannelsList);
    return channel;
  }

  async listProjects(channelId?: string): Promise<ProjectManifest[]> {
    const list = await readJsonStore("projects.json", ProjectsList, []);
    return channelId ? list.filter((p) => p.channelId === channelId) : list;
  }

  async getProject(projectId: string): Promise<ProjectManifest | null> {
    const list = await this.listProjects();
    return list.find((p) => p.projectId === projectId) ?? null;
  }

  async saveProject(project: ProjectManifest): Promise<ProjectManifest> {
    const list = await this.listProjects();
    const idx = list.findIndex((p) => p.projectId === project.projectId);
    if (idx >= 0) list[idx] = project;
    else list.push(project);
    await writeJsonStore("projects.json", list, ProjectsList);
    return project;
  }

  async getAsset(assetId: string): Promise<AssetRecord | null> {
    const list = await this.listAssets();
    return list.find((a) => a.assetId === assetId) ?? null;
  }

  async saveAsset(asset: AssetRecord): Promise<AssetRecord> {
    const list = await this.listAssets();
    const idx = list.findIndex((a) => a.assetId === asset.assetId);
    if (idx >= 0) list[idx] = asset;
    else list.push(asset);
    await writeJsonStore("assets.json", list, AssetsList);
    return asset;
  }

  async listAssets(): Promise<AssetRecord[]> {
    return readJsonStore("assets.json", AssetsList, []);
  }

  async getJob(jobId: string): Promise<JobRecord | null> {
    const list = await readJsonStore("jobs.json", JobsList, []);
    return list.find((j) => j.jobId === jobId) ?? null;
  }

  async getJobByIdempotencyKey(key: string): Promise<JobRecord | null> {
    const list = await readJsonStore("jobs.json", JobsList, []);
    return list.find((j) => j.idempotencyKey === key) ?? null;
  }

  async saveJob(job: JobRecord): Promise<JobRecord> {
    const list = await readJsonStore("jobs.json", JobsList, []);
    const existing = list.find((j) => j.idempotencyKey === job.idempotencyKey);
    if (existing && existing.jobId !== job.jobId) return existing;
    const idx = list.findIndex((j) => j.jobId === job.jobId);
    if (idx >= 0) list[idx] = job;
    else list.push(job);
    await writeJsonStore("jobs.json", list, JobsList);
    return job;
  }

  async appendLedgerEntry(
    entry: CreditLedgerEntry
  ): Promise<CreditLedgerEntry> {
    const list = await this.listLedgerEntries();
    list.push(entry);
    await writeJsonStore("ledger.json", list, LedgerList);
    return entry;
  }

  async listLedgerEntries(projectId?: string): Promise<CreditLedgerEntry[]> {
    const list = await readJsonStore("ledger.json", LedgerList, []);
    return projectId ? list.filter((e) => e.projectId === projectId) : list;
  }

  async getTotalSpentCents(projectId: string): Promise<number> {
    const entries = await this.listLedgerEntries(projectId);
    return entries.reduce((sum, item) => sum + item.costCents, 0);
  }
}
