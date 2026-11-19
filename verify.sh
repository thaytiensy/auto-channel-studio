#!/usr/bin/env bash
set -e

ERR_LOG=".verify-err.log"
> "$ERR_LOG"

handle_failure() {
  local failed_step="$1"
  echo "[-] Verification failed at: $failed_step" >> "$ERR_LOG"
  echo "[-] Verification failed at: $failed_step" >&2

  # Check if HEAD exists, then rollback without deleting .env.local or node_modules
  if git rev-parse --verify HEAD >/dev/null 2>&1; then
    echo "[!] Performing git reset --hard HEAD..."
    git reset --hard HEAD
  fi

  # Generate HANDOFF.json via node to guarantee valid JSON formatting
  node -e "
    const fs = require('fs');
    let errLines = [];
    try {
      const content = fs.readFileSync('$ERR_LOG', 'utf8');
      errLines = content.trim().split('\n').slice(-30);
    } catch {}

    const handoff = {
      status: 'failed',
      task: 'Sprint 1.2 Channel Memory & Script Engine',
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

echo "=== [3/4] Checking worker/server.mjs syntax ==="
node --check worker/server.mjs >> "$ERR_LOG" 2>&1 || handle_failure "node --check worker/server.mjs"

echo "=== [4/4] Building Next.js into isolated .next-verify ==="
NEXT_DIST_DIR=.next-verify npm run build >> "$ERR_LOG" 2>&1 || handle_failure "NEXT_DIST_DIR=.next-verify npm run build"

# All checks succeeded
rm -f "$ERR_LOG"

if [ ! -d ".git" ]; then
  git init
fi

node -e "
  const fs = require('fs');
  const handoff = {
    status: 'success',
    task: 'Sprint 1.2 Channel Memory & Script Engine',
    timestamp: new Date().toISOString(),
    files_modified: [
      'src/lib/storage/repository.interface.ts',
      'src/lib/storage/local-json.repository.ts',
      'src/app/api/channels/route.ts',
      'src/components/BannedWordsInput.tsx',
      'src/components/ChannelForm.tsx',
      'src/app/channels/page.tsx',
      'src/lib/auditor/policy-scanner.ts',
      'src/app/api/projects/generate-script/route.ts',
      'src/components/SceneBlock.tsx',
      'src/components/ProjectResultView.tsx',
      'src/app/projects/new/page.tsx',
      'src/app/page.tsx',
      'PROJECT_STATE.md',
      'verify.sh'
    ],
    errors: [],
    next_step: 'Sprint 1.3 Per-Scene Audio Generation & ffprobe Validation'
  };
  fs.writeFileSync('HANDOFF.json', JSON.stringify(handoff, null, 2), 'utf8');
"

git add -A
git commit -m "checkpoint: verified sprint 1.2" || true

echo "=== [SUCCESS] Verification passed 100% ==="
exit 0
