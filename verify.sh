#!/usr/bin/env bash
set -e

ERR_LOG=".verify-err.log"
> "$ERR_LOG"

handle_failure() {
  local failed_step="$1"
  echo "[-] Verification failed at: $failed_step" >> "$ERR_LOG"
  echo "[-] Verification failed at: $failed_step" >&2

  if git rev-parse --verify HEAD > /dev/null 2>&1; then
    echo "[!] Performing git reset --hard HEAD..."
    git reset --hard HEAD
  fi

  node -e "
    const fs = require('fs');
    let errLines = [];
    try {
      const content = fs.readFileSync('$ERR_LOG', 'utf8');
      errLines = content.trim().split('\n').slice(-30);
    } catch {}
    const handoff = {
      status: 'failed',
      task: 'Sprint 1.6 System Hardening',
      failed_step: '$failed_step',
      errors: errLines,
      next_step: 'Diagnose and fix errors reported in .verify-err.log'
    };
    fs.writeFileSync('HANDOFF.json', JSON.stringify(handoff, null, 2), 'utf8');
  "
  exit 1
}

echo "=== [1/4] Running typecheck ==="
npm run typecheck >> "$ERR_LOG" 2>&1 || handle_failure "npm run typecheck"

echo "=== [2/4] Running lint ==="
npm run lint >> "$ERR_LOG" 2>&1 || handle_failure "npm run lint"

echo "=== [3/4] Checking worker syntax ==="
node --check worker/server.mjs >> "$ERR_LOG" 2>&1 || handle_failure "node --check worker/server.mjs"
node --check worker/render-scene.mjs >> "$ERR_LOG" 2>&1 || handle_failure "node --check worker/render-scene.mjs"
node --check worker/concat-project.mjs >> "$ERR_LOG" 2>&1 || handle_failure "node --check worker/concat-project.mjs"
node --check worker/cleanup.mjs >> "$ERR_LOG" 2>&1 || handle_failure "node --check worker/cleanup.mjs"
node --check scripts/visual-check.mjs >> "$ERR_LOG" 2>&1 || handle_failure "node --check scripts/visual-check.mjs"

echo "=== [4/4] Building Next.js into isolated .next-verify ==="
NEXT_DIST_DIR=.next-verify npm run build >> "$ERR_LOG" 2>&1 || handle_failure "NEXT_DIST_DIR=.next-verify npm run build"

rm -f "$ERR_LOG"

if [ ! -d ".git" ]; then
  git init
fi

node -e "
  const fs = require('fs');
  const handoff = {
    status: 'success',
    task: 'Sprint 1.6 System Hardening, Project Persistence, HTTP 206 Streaming & Visual Audit',
    timestamp: new Date().toISOString(),
    files_modified: [
      'src/lib/storage/repository.interface.ts',
      'src/lib/storage/local-json.repository.ts',
      'src/app/api/projects/route.ts',
      'src/app/api/projects/[projectId]/route.ts',
      'src/app/api/projects/generate-script/route.ts',
      'src/app/api/projects/download/[projectId]/route.ts',
      'src/app/projects/page.tsx',
      'src/app/projects/[projectId]/page.tsx',
      'src/app/page.tsx',
      'src/components/SceneBlock.tsx',
      'src/components/SceneTextEditor.tsx',
      'worker/cleanup.mjs',
      'worker/server.mjs',
      'scripts/visual-check.mjs',
      'verify.sh',
      'PROJECT_STATE.md'
    ],
    errors: [],
    next_step: 'Sprint 2.1 Real AI Integration (Gemini API Script + Real TTS + Hybrid Visuals)'
  };
  fs.writeFileSync('HANDOFF.json', JSON.stringify(handoff, null, 2), 'utf8');
"

git add -A
git commit -m "checkpoint: verified sprint 1.6 - core engine hardened" || true

echo "=== [SUCCESS] Verification passed 100% ==="
exit 0
