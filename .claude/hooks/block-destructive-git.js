#!/usr/bin/env node
/**
 * PreToolUse hook: 파괴적인 git 명령을 차단합니다.
 * - git push --force
 * - git reset --hard
 * - git clean -f
 * - git checkout . (전체 복원)
 */
const fs = require('fs');

try {
  const input = JSON.parse(fs.readFileSync('/dev/stdin', 'utf8'));
  const cmd = input.tool_input?.command || '';

  const destructivePatterns = [
    /git\s+push\s+.*--force/,
    /git\s+push\s+-f\b/,
    /git\s+reset\s+--hard/,
    /git\s+clean\s+-[a-zA-Z]*f/,
    /git\s+checkout\s+\.\s*$/,
  ];

  for (const pattern of destructivePatterns) {
    if (pattern.test(cmd)) {
      process.stdout.write(JSON.stringify({
        decision: 'block',
        reason: `Destructive git command detected: "${cmd}". Requires explicit user approval.`
      }));
      process.exit(0);
    }
  }
} catch (e) {
  // stdin 없거나 파싱 실패 → 무시 (hook이 실행을 방해하면 안 됨)
}
