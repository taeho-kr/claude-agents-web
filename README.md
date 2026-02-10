# dev-ai: Multi-Agent Development System

웹 서비스 개발을 위한 프롬프트 기반 멀티 에이전트 시스템입니다.
Claude Code 위에서 동작하며, 14개 전문 에이전트가 협업합니다.

---

## Quick Start

```bash
# 방법 1: git clone (권장)
git clone https://github.com/your/dev-ai.git my-project
cd my-project
claude
# → 자동으로 dev-ai git 히스토리 제거 + 새 프로젝트 초기화

# 방법 2: 기존 프로젝트에 추가
cp -r dev-ai/* your-existing-project/
cd your-existing-project
claude
# → 기존 git 유지, dev-ai 설정만 추가
```

### 첫 실행 시 자동 동작

1. **Git 초기화**: dev-ai clone인 경우 템플릿 git 히스토리 자동 제거
2. **프로젝트 설정**: 기술 스택, 컨벤션, 선호도 질문
3. **Persistent Context 생성**: `.claude/memory/context/` 파일 작성

이후 실행부터는 초기화 과정 없이 바로 작업 가능합니다.

```bash
# 명령 예시
> autopilot 로그인 기능 구현해줘
> compose researcher → planner → (frontend | backend) → unit-tester
> parallel LoginForm 구현 | /auth/login API | users 테이블 생성
> review src/api/
```

---

## 프로젝트 구조

```
your-project/
├── CLAUDE.md                # 마스터 오케스트레이터 (진입점)
├── README.md                # 프로젝트 설명
└── .claude/
    ├── settings.json        # 시스템 설정
    ├── agents/              # 14개 에이전트 프롬프트
    │   ├── _common.md       #   공통 규칙
    │   ├── _template.md     #   새 에이전트 템플릿
    │   └── {name}.md        #   개별 에이전트
    ├── commands/            # 5개 명령어
    │   ├── autopilot.md     #   전체 자동 실행
    │   ├── compose.md       #   자유 파이프라인
    │   ├── parallel.md      #   병렬 실행
    │   ├── review.md        #   코드/아키텍처 리뷰
    │   └── integration-test.md
    ├── skills/              # 3개 재사용 패턴
    │   ├── auth-flow.md     #   인증 시스템
    │   ├── crud-feature.md  #   CRUD 기능
    │   └── api-integration.md
    ├── references/          # 상세 규칙/절차
    │   ├── output-contracts.md
    │   ├── error-recovery.md
    │   ├── session-management.md
    │   ├── external-integration.md
    │   └── persistent-memory-examples.md
    └── memory/              # Shared Memory
        ├── context/         #   Persistent Context (git 추적)
        ├── plans/           #   작업 계획
        ├── notepads/        #   작업 메모
        ├── decisions/       #   결정 사항
        ├── artifacts/       #   산출물
        └── reports/         #   분석 보고서
```

---

## 명령어

| 명령어 | 설명 | 예시 |
|--------|------|------|
| `autopilot` | 전체 워크플로우 자동 실행 | `autopilot 로그인 기능 구현해줘` |
| `compose` | 에이전트 자유 조합 파이프라인 | `compose researcher → (frontend \| backend)` |
| `parallel` | 독립 작업 병렬 실행 | `parallel 작업1 \| 작업2 \| 작업3` |
| `review` | 코드/아키텍처 리뷰 | `review src/api/` |
| `integration-test` | 통합/E2E 테스트 | `integration-test` |

### autopilot 워크플로우

```
Phase 1: 분석     → [researcher] + [analyst] (병렬)
Phase 2: 설계     → [planner] + [designer]
Phase 3: 구현     → [dba] → [frontend | backend] (병렬)
Phase 4: 검증     → [unit-tester] → [code-reviewer]
                   → FAIL → 피드백 루프 (최대 2회) → PASS → 완료
```

각 Phase 완료 시 git checkpoint 자동 생성. 실패 시 롤백 가능.

---

## 에이전트 (14개)

| 카테고리 | 에이전트 | 역할 |
|----------|----------|------|
| 기획 | pm | PRD, 유저 스토리 |
| 분석 | planner, researcher, analyst | 작업 분해, 코드 분석, 요구사항 |
| 디자인 | designer | UI/UX 스펙 |
| 실행 | executor, frontend, backend, ai-server, dba | 코드 구현 |
| 검증 | architect, code-reviewer, unit-tester, integration-tester | 품질 검증 |

---

## 스킬 (재사용 패턴)

| 스킬 | 트리거 키워드 | 설명 |
|------|-------------|------|
| auth-flow | 로그인, 인증, JWT, OAuth | 인증 시스템 풀 구현 |
| crud-feature | CRUD, 목록, 게시글 + 리소스명 | 리소스 CRUD 풀 구현 |
| api-integration | 외부서비스명 + 연동/통합 | 외부 API 클라이언트 구현 |

---

## Persistent Memory

`.claude/memory/context/`의 4개 파일이 세션 간 프로젝트 지식을 유지합니다:

| 파일 | 내용 | 갱신 시점 |
|------|------|----------|
| preferences.md | 사용자 코딩 선호도 | 선호 표현 시 |
| tech-stack.md | 기술 스택 결정 | 기술 도입/변경 시 |
| conventions.md | 코딩 컨벤션 | 컨벤션 합의 시 |
| project-state.md | 프로젝트 진행 상태 | 매 작업 완료 시 |

작성 예시: `.claude/references/persistent-memory-examples.md`

---

## 안전장치

| 장치 | 설명 |
|------|------|
| workflow-state.md | Phase 진행, 재시도 카운터, 호출 수 추적 |
| git checkpoint | Phase별 자동 커밋, 실패 시 롤백 |
| max_turns | 분석:15, 구현:25, 검증:10 |
| 비용 가드 | 총 에이전트 15회, 피드백 루프 3회 한도 |
| 병렬 안전 | 에이전트별 파일 범위 명시, 공유 파일 순차 |
| 드리프트 감지 | 세션 시작 시 PM vs 실제 코드 비교 |

---

## 핵심 원칙

1. **직접 실행 우선**: 간단한 작업은 에이전트 없이 직접 처리
2. **병렬 최대화**: 독립 작업은 동시 실행
3. **검증 필수**: 구현 후 반드시 테스트/리뷰
4. **증거 기반**: 완료 전 실제 빌드/테스트 결과 확인
5. **모호성 제거**: 불명확하면 추측 대신 질문
