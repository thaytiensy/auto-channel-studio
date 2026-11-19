# Auto Channel Studio — Project State

## 1. Project Overview & Scope
- **Current Sprint**: Sprint 1.1 — Core Skeleton, Data Contracts, Local Repository & FFmpeg Worker
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
  - Standalone Node.js process using native built-in modules (`node:http`, `node:child_process`, `node:util`)
  - External binaries: System `ffmpeg` and `ffprobe` (Gyan.FFmpeg build with `libx264` and `ass` filter)
- **Constraint Compliance**:
  - Strictly no `any` in TypeScript code
  - No unapproved external dependencies (No Supabase, AWS SDK, AI SDK, or Playwright in Sprint 1.1)

## 3. Data Contracts Locked (Per-Scene Audio-First v2.0.0)
- `src/schemas/channel.schema.ts`: `ChannelProfileSchema`, `ChannelProfile`
- `src/schemas/scene.schema.ts`: `WordTimestampSchema`, `VisualLayerSchema`, `SceneSchema`, types
- `src/schemas/project.schema.ts`: `BudgetGuardSchema`, `ProjectManifestSchema` (schemaVersion: "2.0.0"), types
- `src/schemas/ledger.schema.ts`: `AssetRecordSchema`, `JobRecordSchema`, `CreditLedgerEntrySchema`, types
- `src/schemas/index.ts`: Unified export of all schemas and types

## 4. Completed Modules
- **Build Isolation & Windows Config**:
  - `.gitattributes` (`*.sh text eol=lf`)
  - `.gitignore` (excludes `.next-verify/`, `.local-data/`, `worker/tmp/*`, `.verify-err.log`, `.env.local`)
  - `next.config.ts` (`distDir: process.env.NEXT_DIST_DIR || ".next"`)
  - `tsconfig.json` (`.next-verify/types/**/*.ts` in `include`)
  - `eslint.config.mjs` (ignores `.next-verify/**`, `.local-data/**`, `worker/tmp/**`)
  - `.env.example` & `.env.local`
- **Atomic Local Repository**:
  - `src/lib/storage/repository.interface.ts`: `AppRepository` contract
  - `src/lib/storage/local-json-store.ts`: Atomic temp-file write + rename with Zod validation
  - `src/lib/storage/local-json.repository.ts`: Full `AppRepository` implementation
  - `src/lib/storage/index.ts`: `getRepository()` factory
- **FFmpeg Worker**:
  - `worker/server.mjs`: HTTP listener on `127.0.0.1:4001` with `GET /health` diagnostic
- **Health Check API & UI**:
  - `src/app/api/health/route.ts`: Combined repository and worker diagnostic endpoint
  - `src/components/SystemHealthCard.tsx`: Client diagnostic card
  - `src/app/page.tsx`: Studio core dashboard

## 5. In-Progress & Blockers
- **Status**: Sprint 1.1 ready for handoff
- **Blockers**: None
- **Next Step**: Sprint 1.2 — Channel Memory + Script & Policy Auditor
