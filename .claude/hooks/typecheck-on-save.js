#!/usr/bin/env node
/**
 * PostToolUse hook: .ts/.tsx 파일 수정 후 TypeScript 타입 체크를 실행합니다.
 * - tsconfig.json이 없으면 스킵
 * - tsc가 설치되지 않으면 스킵
 * - 에러 발견 시 report (block하지 않음)
 */
const fs = require('fs');
const { execSync } = require('child_process');

try {
  const input = JSON.parse(fs.readFileSync('/dev/stdin', 'utf8'));
  const filePath = input.tool_input?.file_path || input.tool_input?.filePath || '';

  // .ts/.tsx 파일이 아니면 스킵
  if (!/\.(ts|tsx)$/.test(filePath)) process.exit(0);

  // tsconfig.json 존재 확인
  if (!fs.existsSync('tsconfig.json')) process.exit(0);

  // tsc 실행
  try {
    const result = execSync('npx tsc --noEmit --pretty 2>&1', {
      timeout: 30000,
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe']
    });
  } catch (e) {
    const output = e.stdout || e.stderr || '';
    if (output.includes('error TS')) {
      const errors = output.split('\n')
        .filter(l => l.includes('error TS'))
        .slice(0, 5)
        .join('\n');
      process.stdout.write(JSON.stringify({
        decision: 'report',
        reason: `TypeScript errors detected:\n${errors}`
      }));
    }
  }
} catch (e) {
  // hook 실패 시 조용히 무시
}
