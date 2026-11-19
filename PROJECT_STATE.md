# Auto Channel Studio — Project State

## 1. Project Overview & Scope
- **Current Phase**: Phase 2 Complete — Real AI Production Pipeline (Gemini Script + Neural TTS + Safe Zone Subtitles + Ken Burns Visuals)
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
  - `@google/genai`: Official Google Gemini API SDK (text & Imagen image generation)
  - `msedge-tts`: Microsoft Edge Neural Vietnamese Text-to-Speech
- **Worker Infrastructure**:
  - Standalone Node.js process using native built-in modules (`node:http`, `node:child_process`, `node:fs`, `node:path`, `node:util`)
  - External binaries: System `ffmpeg` and `ffprobe` (Gyan.FFmpeg build with `libx264`, `yuv420p`, and `ass` filter)
- **Constraint Compliance**:
  - Strictly no `any` in TypeScript code
  - Every file in `src/` and `worker/` <= 200 lines
  - `playwright` devDependency for visual regression snapshots

## 3. Data Contracts Locked (Per-Scene Audio-First v2.0.0)
- `src/schemas/channel.schema.ts`: `ChannelProfileSchema`, `ChannelProfile`
- `src/schemas/scene.schema.ts`: `WordTimestampSchema`, `VisualLayerSchema` (with `visualPrompt`), `SceneSchema`, types
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
  - Mock Script Engine (`src/app/api/projects/generate-script/route.ts` with policy check)
  - Scene UI Component (`src/components/SceneBlock.tsx`)
  - Project Creation & Script Review Studio (`src/app/projects/new/page.tsx` with red policy alert banner)
- **Sprint 1.3 — Per-Scene Audio Generator & ffprobe Validation**:
  - Audio Processor Module (`src/lib/audio/audio-processor.ts`) with `getAudioDurationMs`
- **Sprint 1.4 — FFmpeg Worker Video Rendering & Safe Zone Preview**:
  - Worker Video Renderer (`worker/render-scene.mjs`) generating 1080x1920 MP4 via `execFile`
  - Worker Endpoint `POST /render-scene` on `worker/server.mjs`
  - Safe Zone Preview Component (`src/components/SafeZonePreview.tsx`) simulating TikTok/Reels phone layout
- **Sprint 1.5 — Final Multi-Scene Concat & Downloadable MP4 Output**:
  - Multi-scene Concat Engine (`worker/concat-project.mjs`) using normalized POSIX paths and `-safe 0`
  - Worker Endpoint `POST /render-project` on `worker/server.mjs`
  - Next.js Download Streaming Route (`src/app/api/projects/download/[projectId]/route.ts`)
- **Sprint 1.6 — System Hardening, Project Persistence, HTTP 206 Streaming & Visual Audit**:
  - `ProjectOperations` interface (`list`, `getById`, `create`, `update`) in `AppRepository`
  - Project CRUD APIs (`/api/projects` and `/api/projects/[projectId]`)
  - Projects list page (`/projects`) and detail page (`/projects/[projectId]`)
  - Worker in-flight lock (`activeLocks`) and `cleanupTmpFiles()`
  - HTTP 206 Partial Content Range streaming support
  - Playwright visual regression check script
- **Sprint 2.1 — Gemini Real Script Engine**:
  - Official `@google/genai` SDK integration with Gemini structured outputs
  - `generateChannelScript()` respecting channel niche, brand voice, and banned words
  - Visual prompts in English generated per scene
- **Sprint 2.2 — Real Neural TTS & Safe Zone Subtitles**:
  - `generateSceneSpeech()` using `msedge-tts` with `vi-VN-HoaiMyNeural`
  - Safe Zone ASS subtitle generator (`worker/subtitle-builder.mjs`) tuned for TikTok/Reels
  - FFmpeg ASS filter integration with Windows path escaping (`worker/ffmpeg-filters.mjs`)
- **Sprint 2.3 — AI Visual Generation & Ken Burns Motion**:
  - `generateSceneVisual()` via Gemini Imagen 3 with graceful quota fallback
  - Ken Burns zoompan motion filter chain in `worker/render-scene.mjs`
  - Integrated scene editing for both spoken text and visual prompt in `SceneBlock.tsx`
- **Packaging & Auto MXH Pipeline (Phase 2 Extension)**:
  - Auto Video Generation API (`/api/auto-video`) supporting both direct topics and fixed source links
  - Auto MXH Video Studio UI (`/auto`) with real-time pipeline status and 1-click fixed link copying
  - Desktop Packaging: `start-app.bat` launcher, `scripts/start-all.mjs` multi-process orchestrator, and Desktop Shortcut `.lnk`
  - Command-line automation tool `scripts/auto-cli.mjs` (`npm run auto:video`)
- **Production Cloud Deployment (GitHub + Vercel)**:
  - GitHub Remote Repository: `https://github.com/thaytiensy/auto-channel-studio`
  - Vercel Production Deployment: `https://auto-channel-studio.vercel.app`
  - Continuous Deployment: Connected GitHub `main` branch to Vercel auto-deploy pipeline

## 5. In-Progress & Blockers
- **Status**: Live in Production — GitHub Repository and Vercel Cloud Live Link Active (HTTP 200 OK)
- **Blockers**: None
- **Next**: Phase 3 — Scheduled Background Cron & Social Media Auto-Publishing
