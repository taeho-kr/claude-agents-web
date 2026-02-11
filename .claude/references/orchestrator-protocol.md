# Orchestrator Protocol (상세 절차)

> CLAUDE.md의 상세 운영 절차. 오케스트레이터가 해당 Phase 진입 시 참조합니다.

---

## 세션 초기화 프로토콜

### Phase 0: 첫 실행 감지 (1회성)

`.claude/memory/.initialized` 파일 존재 여부로 첫 실행을 판단합니다.

```
.claude/memory/.initialized 없음 → 첫 실행 (Git 초기화 절차 실행)
.claude/memory/.initialized 있음 → 기존 프로젝트 (Phase 1로 스킵)
```

### Git 초기화 절차 (첫 실행 시)

dev-ai를 `git clone`으로 받은 경우, 템플릿의 git 히스토리를 제거하고 새 프로젝트로 시작합니다.

#### Step 1: 현재 상태 확인

| 확인 항목 | 방법 | 결과 변수 |
|----------|------|----------|
| .git 폴더 존재 | Glob으로 `.git` 폴더 확인 | `HAS_GIT` |
| origin URL | `git config --get remote.origin.url` | `ORIGIN_URL` |
| 작업 트리 상태 | `git status --porcelain` | `IS_CLEAN` |

#### Step 2: 분기 처리

```
HAS_GIT = false
  → "git 저장소가 아닙니다. 새로 초기화할까요?" (AskUserQuestion)
  → 승인 시: git init → git add . → git commit

HAS_GIT = true AND ORIGIN_URL에 "dev-ai" 포함 AND IS_CLEAN = true
  → 자동으로 git 초기화 실행

HAS_GIT = true AND ORIGIN_URL에 "dev-ai" 포함 AND IS_CLEAN = false
  → 사용자에게 처리 방법 선택 요청

HAS_GIT = true AND ORIGIN_URL에 "dev-ai" 미포함
  → 기존 프로젝트 유지 여부 질문
```

#### Step 3: Git 초기화 실행

1. `.git` 폴더 삭제 (Windows: `Remove-Item -Recurse -Force .git`, Unix: `rm -rf .git`)
2. `git init`
3. `git add .`
4. `git commit -m "chore: init project from dev-ai template"`

### Phase 1: Persistent Context 로드

```
1. Read(".claude/memory/context/project-state.md")
2. Read(".claude/memory/context/tech-stack.md")
3. Read(".claude/memory/context/conventions.md")
4. Read(".claude/memory/context/preferences.md")
5. 드리프트 감지:
   - 패키지 매니저 파일과 tech-stack.md 비교
   - 불일치 시 → 사용자 보고 + 업데이트 제안
6. workflow-state.md 존재 시 → 미완료 워크플로우 복원
```

### 초기 설정 절차 (Persistent Context가 템플릿 상태일 때)

```
1. 프로젝트 자동 감지 (package.json, pyproject.toml 등)
2. AskUserQuestion으로 기술 스택, 컨벤션 확인
3. Persistent Context 4개 파일 작성
4. .claude/memory/.initialized 생성
5. 작성 예시: .claude/references/persistent-memory-examples.md
```

빈 디렉토리인 경우:
```
1. 프로젝트 목적 질문
2. 기술 스택 선택
3. 스캐폴딩 + Persistent Context 작성
4. .claude/memory/.initialized 생성
```

---

## 에이전트 호출 프로토콜 (네이티브 서브에이전트)

각 에이전트는 `.claude/agents/{name}.md`에 YAML frontmatter로 정의됩니다.
Claude Code가 **모델 라우팅, 도구 제한, 턴 제한, 스킬 주입**을 자동 처리합니다.

### 호출 방식

```javascript
// 네이티브 서브에이전트 호출 (프롬프트/모델/도구 자동 로드)
Task({
  subagent_type: "{agent-name}",   // agents/{name}.md의 name 필드
  prompt: `
## Persistent Context
${tech-stack, conventions, preferences 중 필요한 것}

## 현재 작업
### 컨텍스트
${관련 산출물 (codebase.md, requirements.md 등)}
### 할 일
${구체적인 작업 지시}
### 완료 기준
${검증 가능한 완료 조건}
### 산출물 포맷
${해당 에이전트의 output-contracts 포맷}
`,
  description: "{agent}: {작업 요약}"
})
```

### 자동 처리 항목 (frontmatter에서 정의)

| 항목 | 이전 (수동) | 현재 (자동) |
|------|-------------|-------------|
| 에이전트 프롬프트 | `Read(agents/{name}.md)` | frontmatter + 본문 자동 로드 |
| 공통 규칙 | `Read(agents/_common.md)` | `skills: [agent-common]` 자동 주입 |
| 모델 라우팅 | `model:` 파라미터 직접 지정 | frontmatter `model:` 자동 적용 |
| 도구 제한 | 프롬프트로 지시 | frontmatter `tools:` 강제 적용 |
| 턴 제한 | `max_turns:` 파라미터 | frontmatter `maxTurns:` 자동 적용 |

### 모델 라우팅 (frontmatter에 정의됨)

| 티어 | 모델 | 에이전트 | 근거 |
|------|------|----------|------|
| Critical | opus | architect, code-reviewer | 아키텍처/보안 판단 정확도 |
| Standard | inherit | frontend, backend, dba, ai-server, planner, designer, pm, integration-tester | 복잡한 구현/설계 |
| Fast | haiku | researcher, analyst, unit-tester, executor | 탐색/실행 속도 |

### 컨텍스트 선별 기준

오케스트레이터가 `prompt`에 주입할 컨텍스트만 결정합니다.

```
분석/기획 에이전트:
  필수: Persistent Context (tech-stack, conventions, preferences)
  선택: 없음 (컨텍스트 생성 역할)

구현 에이전트:
  필수: Persistent Context
  필수: plans/current.md (해당 에이전트 부분만 발췌)
  선택: codebase.md, requirements.md (관련 섹션만)

검증 에이전트:
  필수: Persistent Context
  필수: 검증 대상 코드 파일 경로
  선택: plans/current.md (의도 파악용)
```

---

## 워크플로우 상세

### autopilot 전체 흐름

```
Phase 0 (선택): [pm] PRD → .claude/memory/artifacts/prd.md
Phase 1: [researcher] + [analyst] 병렬 → codebase.md, requirements.md
Phase 2: [planner] + [designer] → plans/current.md, design-spec.md
Phase 3: [dba] → [frontend|backend|ai] 병렬 → 코드 구현
Phase 4: [unit-tester] → [code-reviewer] → [architect] → PASS/FAIL
Phase 5: 완료 → project-state.md 갱신, workflow-state.md 삭제
```

### 피드백 루프

```
[code-reviewer] Critical 발견
  → 피드백 추출 (파일:라인, 문제, 수정안)
  → 구현 에이전트 재호출 (피드백 포함)
  → 재검증
  → 2회 FAIL → 사용자 보고

[architect] NEEDS_REVISION
  → 피드백 추출 (권장사항, 승인 조건)
  → [planner] 재호출 → 계획 수정 → 구현 재실행
  → REJECTED → 사용자 보고
```

실패 유형별 상세: `.claude/references/error-recovery.md`

### Phase별 Git Checkpoint

```
Phase 완료 → git add + git commit "[autopilot] Phase N: {요약}"
Phase 실패 → git restore로 롤백 가능
```

체크포인트 커밋 해시를 workflow-state.md 롤백 포인트에 기록.

---

## 병렬 실행 안전 정책

planner가 작업 계획 시 **에이전트별 파일 영향 범위를 반드시 명시**.

### 기본 범위 가이드

```
[frontend] UI 컴포넌트, 페이지, 훅, 스타일 파일
[backend]  API 라우트, 서비스, 미들웨어 파일
[dba]      스키마, 마이그레이션, DB 유틸 파일
[ai-server] ML 서비스, 모델 관련 파일
```

**공유 파일** (타입 정의, 공유 유틸, 패키지 설정 등):
→ 병렬 금지. 한 에이전트가 먼저 수정 후 다음 에이전트 실행.

### Git Worktree 격리 (고급)

병렬 에이전트가 **같은 파일을 수정할 가능성이 있을 때**, git worktree로 물리적 격리합니다.
파일 범위 명시만으로 충분한 경우(대부분)에는 사용하지 않습니다.

#### 사용 조건

```
다음 조건이 모두 참일 때만 worktree 격리 사용:
1. 3개 이상 에이전트가 동시 실행
2. planner가 파일 충돌 가능성을 명시
3. 공유 파일 수정이 불가피
```

#### 워크플로우

```
1. 준비: 현재 브랜치에서 에이전트별 worktree 생성
   git worktree add .worktrees/frontend feat/frontend
   git worktree add .worktrees/backend feat/backend

2. 실행: 각 에이전트에게 worktree 경로를 작업 디렉토리로 지정
   Task({ prompt: "작업 디렉토리: .worktrees/frontend ..." })

3. 병합: 모든 에이전트 완료 후 순차 병합
   git checkout main
   git merge feat/frontend
   git merge feat/backend   ← 충돌 시 오케스트레이터가 해결

4. 정리: worktree 제거
   git worktree remove .worktrees/frontend
   git worktree remove .worktrees/backend
```

#### 충돌 해결

```
자동 병합 성공 → 계속 진행
충돌 발생 → 충돌 파일 목록 확인
  → 타입 정의/인터페이스 충돌: 양쪽 변경 모두 포함
  → 로직 충돌: 사용자에게 선택 요청 (AskUserQuestion)
  → 병합 후 unit-tester 재실행으로 검증
```

#### .gitignore

```
# worktree 디렉토리는 git 추적 제외
.worktrees/
```

---

## 스킬 매칭 절차

```
1. 사용자 요청 → 키워드 매칭
2. 복수 매칭 시 → 각 스킬의 "트리거하지 않는 경우" 확인
3. 전제 조건 미충족 시 → 사용자 질문
4. 파라미터 추출 → 스킬 워크플로우 실행
5. 미매칭 시 → 일반 워크플로우
```

| 스킬 | 키워드 | 파일 |
|------|--------|------|
| auth-flow | 로그인, 인증, JWT, OAuth, 2FA | `.claude/skills/auth-flow.md` |
| crud-feature | CRUD, 목록, 게시판 + 리소스명 | `.claude/skills/crud-feature.md` |
| api-integration | 연동, 통합 + 외부서비스명 | `.claude/skills/api-integration.md` |

---

## Persistent Context 업데이트 규칙

### 증거 임계값 (2+ 세션)

단일 세션에서 관찰된 패턴은 즉시 persistent context에 반영하지 않습니다.

```
1회 관찰 → notepads에 기록 (후보)
2회 이상 반복 → persistent context에 반영
예외: 사용자가 명시적으로 선호도를 표현한 경우 → 즉시 반영
```

### 업데이트 시점

| 파일 | 업데이트 시점 | 권한 |
|------|-------------|------|
| preferences.md | 사용자 선호 표현 시 | 오케스트레이터만 |
| tech-stack.md | 기술 도입/변경 확정 시 | 오케스트레이터만 |
| conventions.md | 2+ 세션 반복 패턴 확인 시 | 오케스트레이터만 |
| project-state.md | 매 작업 완료 시 | 오케스트레이터만 |

---

## 워크플로우 상태 관리

포맷: `.claude/references/output-contracts.md`의 workflow-state 섹션.

### 생성 조건

| 명령 | 생성 | 조건 |
|------|------|------|
| autopilot | ✅ | 다단계 워크플로우 |
| compose | ✅ | 에이전트 파이프라인 |
| parallel | ✅ | 병렬 에이전트 실행 |
| 단일 에이전트 | ❌ | - |
| 직접 실행 | ❌ | - |

### 상태 기록 시점

```
워크플로우 시작     → 생성
Phase 전환         → Phase 상태 + git checkpoint
에이전트 호출      → 호출 기록 추가
피드백 루프 진입   → 재시도 카운터 증가
워크플로우 종료    → 삭제 또는 완료 표시
```

---

## 에이전트 지연 로딩

네이티브 서브에이전트는 `Task({ subagent_type: "{name}" })` 호출 시 **자동으로 로드**됩니다.
오케스트레이터가 수동으로 에이전트 프롬프트를 읽을 필요가 없습니다.

### Phase별 호출 대상

| Phase | 호출 대상 | 비고 |
|-------|----------|------|
| Phase 0 | 없음 | 초기화는 오케스트레이터 직접 처리 |
| Phase 1 | researcher, analyst | 병렬 호출 |
| Phase 1.5 | 없음 | 오케스트레이터가 직접 결정 잠금 |
| Phase 2 | planner, designer | UI 작업 포함 시 병렬 |
| Phase 3 | dba, frontend, backend, ai-server | 필요한 것만, 의존성 순서 |
| Phase 4 | unit-tester, code-reviewer | 순차 실행 |

---

## 계층적 메모리 검색

Shared Memory(`.claude/memory/`)가 커질수록 전체를 읽는 것은 비효율적입니다.
3단계 검색으로 필요한 정보만 로드합니다.

### 3-Layer Retrieval

```
Layer 1: 인덱스 검색 (Glob + Grep)
  → 파일명 목록만 반환 (토큰 최소)
  → Glob(".claude/memory/**/*.md") + Grep(키워드, output_mode: "files_with_matches")

Layer 2: 섹션 스캔 (Grep with context)
  → 매칭된 파일의 관련 섹션만 읽기
  → Grep(키워드, path: 매칭파일, output_mode: "content", context: 5)

Layer 3: 전체 읽기 (Read)
  → 직접 필요한 파일만 전체 로드
  → Read(확정된 파일 경로)
```

### 적용 시점

| 상황 | 레이어 |
|------|--------|
| Persistent Context 로드 (4개 파일) | Layer 3 직접 (항상 필요) |
| 이전 작업 결과 확인 | Layer 1 → Layer 2 |
| 에이전트 산출물 참조 | Layer 1 → Layer 3 |
| 특정 결정사항 확인 | Layer 1 → Layer 2 → Layer 3 |

### 예시: 이전 코드 리뷰 결과 찾기

```
Step 1: Grep("Critical", path: ".claude/memory/decisions/", output_mode: "files_with_matches")
  → decisions/code-review.md 발견

Step 2: Grep("Critical", path: ".claude/memory/decisions/code-review.md", output_mode: "content", context: 5)
  → 해당 섹션만 확인

Step 3: (필요 시) Read(".claude/memory/decisions/code-review.md")
  → 전체 리뷰 결과 로드
```

---

## 결정 잠금 단계 (Phase 1.5)

분석(Phase 1)과 설계(Phase 2) 사이에 **핵심 결정을 확정**하는 단계입니다.
설계/구현 중 방향 전환을 방지합니다.

### autopilot 워크플로우 (수정)

```
Phase 1:   분석     → [researcher] + [analyst] (병렬)
Phase 1.5: 결정 잠금 → 오케스트레이터가 사용자와 확인
Phase 2:   설계     → [planner] + [designer]
Phase 3:   구현     → [dba] → [frontend|backend|ai] (병렬)
Phase 4:   검증     → [unit-tester] → [code-reviewer]
```

### 결정 잠금 절차

```
1. Phase 1 산출물에서 결정 필요 항목 추출:
   - researcher → 기술적 선택지 (라이브러리, 패턴)
   - analyst → 요구사항 우선순위, 엣지케이스 처리 방식

2. 결정 항목 정리:
   - 아키텍처 패턴 (MVC, 클린 아키텍처 등)
   - 기술 선택 (ORM, 상태 관리, 인증 방식 등)
   - 범위 확정 (Must/Should/Could 중 이번에 구현할 것)
   - 비기능 요구사항 (성능 목표, 접근성 수준)

3. AskUserQuestion으로 결정 확인:
   - 선택지 + 각각의 트레이드오프 제시
   - 오케스트레이터의 추천 포함

4. 확정된 결정을 .claude/memory/decisions/locked-decisions.md에 기록

5. planner에게 확정 결정을 컨텍스트로 전달
```

### locked-decisions.md 포맷

```markdown
# 결정 사항 (Phase 1.5)

## 확정 결정
| # | 결정 항목 | 선택 | 근거 |
|---|----------|------|------|
| 1 | 인증 방식 | JWT + HttpOnly Cookie | SPA 환경, 보안 우선 |
| 2 | ORM | Prisma | 기존 프로젝트 컨벤션 |

## 범위
- Must: [확정 항목]
- Deferred: [이번에 안 하는 것]

## 제약
- [합의된 기술적/시간적 제약]
```

### 스킵 조건

다음 경우 Phase 1.5를 건너뜁니다:
- 단순 버그 수정 (결정할 것 없음)
- 이전 결정이 그대로 유효한 반복 작업
- 사용자가 명시적으로 모든 결정을 지시한 경우

---

## Agent Teams를 이용한 병렬 실행 (opt-in)

> 실험적 기능. 환경변수 `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1` 필요.

Agent Teams는 여러 Claude Code 인스턴스가 **공유 태스크 리스트와 메시징**으로 협업하는 기능입니다.
기본값은 일반 서브에이전트 병렬 호출(현행)이며, 특정 조건에서만 Teams 사용을 고려합니다.

### 서브에이전트 vs Agent Teams

| 특성 | 서브에이전트 (기본) | Agent Teams |
|------|-------------------|-------------|
| 통신 | 결과만 반환 | 에이전트 간 메시징 가능 |
| 조율 | 오케스트레이터가 모든 결과 종합 | 공유 태스크 리스트로 자율 조율 |
| 오버헤드 | 낮음 | 높음 (별도 인스턴스) |
| 적합 상황 | 독립적인 병렬 작업 | 에이전트 간 소통이 필요한 작업 |

### 사용 조건

```
다음 조건이 모두 참일 때 Agent Teams 사용을 고려:
1. 3개 이상 에이전트가 동시 작업
2. 에이전트 간 소통 필요 (예: frontend가 backend에 API 스펙 질문)
3. 공유 태스크 리스트로 자동 조율이 유리한 경우
```

### Agent Teams 워크플로우

```
1. 오케스트레이터가 Team Lead 역할
2. 에이전트별 Teammate 생성 (서브에이전트 설정 상속)
3. 공유 태스크 리스트에 Phase 3 작업 등록
4. Teammate들이 자율적으로 태스크 claim → 완료
5. Lead가 결과 종합 → Phase 4로 진행
```

### 제한사항

- 실험적 기능 (세션 재개 시 teammate 복원 안됨)
- VS Code 통합 터미널에서 split-pane 미지원
- 토큰 비용이 서브에이전트 대비 높음
- 기본값은 일반 서브에이전트 병렬 호출 유지

---

## Ralph 영속 루프 프로토콜

### 개요

`ralph` 명령은 sisyphus 에이전트를 반복 호출하여 작업이 완료될 때까지 실행합니다.
autopilot이 14개 전문 에이전트를 조율하는 반면, ralph은 **단일 자율 에이전트를 반복 실행**합니다.

### autopilot vs ralph 사용 기준

| 상황 | 권장 | 이유 |
|------|------|------|
| 대규모 신규 기능 (PRD, 설계, DB, UI, API) | autopilot | 전문 에이전트 깊이 필요 |
| 중간 규모 기능/리팩토링 | ralph | 빠른 반복, 단일 컨텍스트 효율 |
| 버그 수정, 성능 개선 | ralph | 집중 반복 적합 |
| 세션 간 연속 작업 필요 | ralph | loop-state 영속화 |
| UI/UX 디자인이 중요 | autopilot | designer 에이전트 활용 |
| 아키텍처 검토 필수 | autopilot | architect(opus) 활용 |
| "될 때까지" 완료 보장 필요 | ralph | 자동 반복 |

### 루프 관리 규칙

```
시작:
  1. loop-state.md 생성
  2. Persistent Context 로드
  3. 완료 기준 결정

반복 (1..50):
  1. 이전 반복 컨텍스트 구성
  2. Task({ subagent_type: "sisyphus", prompt: ... })
  3. 결과 평가 + loop-state.md 업데이트
  4. git commit "[ralph] iteration N: 결과 요약"
  5. 완료 판단 → 완료/계속/중단

종료:
  - 완료: loop-state.md 삭제, project-state.md 갱신
  - 한도 도달/연속 실패: loop-state.md 유지 (재개 가능)
```

### 연속 실패 감지

매 반복 후 sisyphus의 미완료 사항을 이전 반복과 비교합니다.

```
같은 미완료 사항이 3회 연속 동일 → 진전 없음 판단 → 자동 중단

예:
  iteration 3: 미완료 - "TypeScript 타입 에러 해결 불가"
  iteration 4: 미완료 - "TypeScript 타입 에러 해결 불가"
  iteration 5: 미완료 - "TypeScript 타입 에러 해결 불가"
  → 연속 실패 3회 → 자동 중단 + 사용자 보고
```

### 세션 재개

```
세션 시작 시:
  1. loop-state.md 존재 확인
  2. status가 in_progress 또는 paused인 경우:
     → 사용자에게 재개 여부 확인 (AskUserQuestion)
     → 승인: 마지막 iteration + 1부터 재개
     → 거부: loop-state.md 삭제

ralph --resume:
  → 사용자 확인 없이 즉시 재개
```

### 비용 가드

```
sisyphus max_turns: 50 (per iteration)
전체 반복 한도: 50회
연속 실패 한도: 3회
```
