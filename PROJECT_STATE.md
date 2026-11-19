# Auto Channel Studio — Project State

## 1. Project Overview & Scope
- **Current Sprint**: Sprint 1.6 — System Hardening, Project Persistence, HTTP 206 Streaming & Visual Audit
- **Runtime & Framework Versions**:
  - **Next.js**: 16.4.6 (App Router)
  - **React**: 19.3.0
  - **Tailwind CSS**: 4.3.3 (Tailwind v4 CSS-first configuration via `@tailwindcss/turbopack`)
  - **TypeScript**: 5.x
  - **Node.js**: v24.22.1
  - **Platform**: Windows 10 Pro 64-bit with Git Bash

## 2. Approved Libraries & Tools
- **Core Dependencies**:
  - `zod`: Schema validation & contract enforcement
  - `lucide-react`: UI iconography
- **Worker Infrastructure**:
  - Standalone Node.js process using native built-in modules (`node:http`, `node:child_process`, `node:fs`, `node:path`, `node:util`)
  - External binaries: System `ffmpeg` and `ffprobe` (Gyan.FFmpeg build with `libx264`, `yuv420p`, and `ass` filter)
- **Constraint Compliance**:
  - Strictly no `any` in TypeScript code
  - Every file in `src/` and `worker/` <= 200 lines
  - `playwright` added as `devDependency` for visual regression snapshots (no browser download, uses system Edge)

## 3. Data Contracts Locked (Per-Scene Audio-First v2.0.0)
- `src/schemas/channel.schema.ts`: `ChannelProfileSchema`, `ChannelProfile`
- `src/schemas/scene.schema.ts`: `WordTimestampSchema`, `VisualLayerSchema`, `SceneSchema`, types
- `src/schemas/project.schema.ts`: `BudgetGuardSchema`, `ProjectManifestSchema` (schemaVersion: "2.0.0"), types
- `src/schemas/ledger.schema.ts`: `AssetRecordSchema`, `JobRecordSchema`, `CreditLedgerEntrySchema`, types
- `src/schemas/index.ts`: Unified export of all schemas and types

## 4. Completed Modules
- **Sprint 1.1 — Core Skeleton, Data Contracts, Local Repository & FFmpeg Worker**:
  - Build isolation (`distDir: process.env.NEXT_DIST_DIR || ".next"`)
  - Atomic Local JSON Repository (`AppRepository`, `LocalJsonRepository`)
  - FFmpeg standalone render worker (`worker/server.mjs` on port 4001)
  - Diagnostics API (`src/app/api/health/route.ts`) & Dashboard card (`src/components/SystemHealthCard.tsx`)
- **Sprint 1.2 — Channel Memory, Policy Auditor & Mock Script Engine**:
  - Channel Memory API (`src/app/api/channels/route.ts` with GET/POST and Zod omit validation)
  - Interactive Tag Input for Banned Words (`src/components/BannedWordsInput.tsx`)
  - Channel Creation Form (`src/components/ChannelForm.tsx`)
  - Channel Management Dashboard (`src/app/channels/page.tsx`)
  - Policy Auditor & Regex Scanner (`src/lib/auditor/policy-scanner.ts`)
  - Mock Script Engine (`src/app/api/projects/generate-script/route.ts` with 3-scene mock manifest and policy check)
  - Scene UI Component (`src/components/SceneBlock.tsx`)
  - Project Creation & Script Review Studio (`src/app/projects/new/page.tsx` with red policy alert banner)
- **Sprint 1.3 — Per-Scene Audio Generator & ffprobe Validation**:
  - Audio Processor Module (`src/lib/audio/audio-processor.ts`) with `mockGenerateTTS` (atomic path creation in `worker/tmp`) and `getAudioDurationMs` (`ffprobe` duration probing with non-crashing 3500ms fallback)
  - Integration into Script Generation API (`src/app/api/projects/generate-script/route.ts`) generating audio paths and probed duration per scene
  - Updated Scene UI (`src/components/SceneBlock.tsx`) displaying audio path and duration without native audio elements
- **Sprint 1.4 — FFmpeg Worker Video Rendering & Safe Zone Preview**:
  - Worker Video Renderer (`worker/render-scene.mjs`) generating 1080x1920 MP4 via `execFile` (`libx264`, `-pix_fmt yuv420p`, silent audio fallback)
  - Worker Endpoint `POST /render-scene` on `worker/server.mjs`
  - Next.js Bridge Route (`src/app/api/projects/render-scene/route.ts`) with timeout and HTTP 503 worker offline messaging
  - Safe Zone Preview Component (`src/components/SafeZonePreview.tsx`) simulating TikTok/Reels phone layout and interactive overlay
  - Scene Block Render Controls (`src/components/SceneBlock.tsx`) and 2-column layout in `src/components/ProjectResultView.tsx`
- **Sprint 1.5 — Final Multi-Scene Concat & Downloadable MP4 Output (MVP Pipeline Complete)**:
  - Multi-scene Concat Engine (`worker/concat-project.mjs`) using normalized POSIX paths and `-safe 0`
  - Worker Endpoint `POST /render-project` on `worker/server.mjs`
  - Next.js Render-Full Bridge Route (`src/app/api/projects/render-full/route.ts`)
  - Next.js Download Streaming Route (`src/app/api/projects/download/[projectId]/route.ts`) with path traversal safety and `Promise<{ projectId: string }>` params
  - Studio Finalization Action Bar (`src/components/ProjectResultView.tsx`) with full render button, direct download link, and inline video player
- **Sprint 1.6 — System Hardening, Project Persistence, HTTP 206 Streaming & Visual Audit**:
  - `ProjectOperations` interface (`list`, `getById`, `create`, `update`) added to `AppRepository` and implemented in `LocalJsonRepository`
  - Project list API (`src/app/api/projects/route.ts` GET)
  - Project CRUD API (`src/app/api/projects/[projectId]/route.ts` GET + PATCH with Zod validation)
  - `generate-script/route.ts` now persists project via `repo.projects.create()`
  - Projects list page (`src/app/projects/page.tsx`) and detail page (`src/app/projects/[projectId]/page.tsx`)
  - Homepage updated with `/projects` navigation link
  - `SceneTextEditor.tsx` sub-component for inline scene text editing
  - `SceneBlock.tsx` with inline edit + "Lưu Cảnh" (PATCH to API)
  - Worker in-flight lock (`activeLocks: Set`) for `/render-scene` and `/render-project` → HTTP 409 on duplicate
  - `worker/cleanup.mjs`: `cleanupTmpFiles()` deletes stale tmp files > 24h
  - Worker `POST /cleanup` endpoint
  - `src/app/api/projects/download/[projectId]/route.ts` upgraded to HTTP 206 Partial Content with Range support
  - `scripts/visual-check.mjs` Playwright snapshot script (Edge → Chromium fallback)
  - `npm run visual:check` added to `package.json`
  - `.preview/` added to `.gitignore` and `eslint.config.mjs` ignore list

## 5. In-Progress & Blockers
- **Status**: Sprint 1.6 complete and verified — System hardened, project persistence live, HTTP 206 streaming active
- **Blockers**: None
- **Next**: Sprint 2.1 — Real AI Integration (Gemini API Script + Real TTS/Whisper + Hybrid Visuals)
