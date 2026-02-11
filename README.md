# dev-ai: Multi-Agent Development System

웹 서비스 개발을 위한 프롬프트 기반 멀티 에이전트 시스템입니다.
Claude Code 위에서 동작하며, 15개 전문 에이전트가 협업합니다.

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
# 자연어로 요청하면 오케스트레이터가 자동 처리
> 로그인 기능 구현해줘
> 코드 리뷰해줘
> API 추가하고 테스트까지 작성해줘
> ralph 버그 수정해줘    # 완료까지 반복 실행
```

---

## 3-Step Dynamic Dispatch

모든 요청은 동일한 3단계 흐름으로 처리됩니다.
사용자가 실행 방식을 선택할 필요 없이, 자연어로 요청하면 됩니다.

```
Step 1: 요청 분석
  사용자 자연어 → 의도 파악 + 복잡도 판단

Step 2: 에이전트 선택 + 태스크 그래프
  최적 에이전트 선택 (복수 가능) → 의존성 DAG 생성
  → 에이전트 3개+ 시 사용자 승인 요청

Step 3: 백그라운드 실행 + 순환 모니터링
  의존성 없는 에이전트부터 백그라운드 실행 →
  round-robin 폴링 → 완료 시 후속 에이전트 실행 →
  모든 에이전트 완료까지 반복
```

### 예시: "로그인 기능 구현해줘"

```
1. researcher + analyst (병렬 분석)
2. planner (설계)
3. dba (DB 스키마)
4. frontend + backend (병렬 구현)
5. unit-tester (테스트)
6. code-reviewer (리뷰)
```

### ralph 워크플로우

`ralph`은 유일한 별도 명령어입니다. sisyphus(자율 에이전트)를 반복 호출하여 "될 때까지" 실행합니다.

```
ralph [요청]
  │
  ├─ loop-state.md 생성
  ├─ Persistent Context 로드
  │
  └─ 반복 (max 50회)
       │
       ├─ [sisyphus] 호출 (분석→설계→구현→검증 올인원)
       ├─ 결과 평가 + loop-state.md 업데이트
       ├─ git commit "[ralph] iteration N: 요약"
       │
       ├─ ✅ 완료 → 성공 종료
       ├─ ❌ 3회 연속 동일 실패 → 자동 중단
       └─ ⚠️ 미완료 → 다음 반복
```

| 상황 | 권장 | 이유 |
|------|------|------|
| 대규모 신규 기능 | 일반 요청 | 전문 에이전트 깊이 필요 |
| 중간 규모 기능/버그 수정 | ralph | 빠른 반복, 완료 보장 |
| 세션 간 연속 작업 | ralph | loop-state 영속화 |

---

## 프로젝트 구조

```
your-project/
├── CLAUDE.md                # 마스터 오케스트레이터 (진입점)
├── README.md                # 프로젝트 설명
└── .claude/
    ├── settings.json        # 시스템 설정
    ├── agents/              # 15개 네이티브 서브에이전트 (YAML frontmatter)
    │   ├── _template.md     #   새 에이전트 템플릿
    │   └── {name}.md        #   개별 에이전트 (name, tools, model, skills 정의)
    ├── commands/            # 명령어
    │   └── ralph.md         #   영속 루프 실행
    ├── skills/              # 재사용 패턴 + 에이전트 공통 규칙
    │   ├── agent-common.md  #   에이전트 공통 규칙 (자동 주입)
    │   ├── auth-flow.md     #   인증 시스템
    │   ├── crud-feature.md  #   CRUD 기능
    │   └── api-integration.md
    ├── references/          # 상세 규칙/절차
    │   ├── orchestrator-protocol.md
    │   ├── output-contracts.md
    │   ├── error-recovery.md
    │   ├── session-management.md
    │   ├── external-integration.md
    │   ├── persistent-memory-examples.md
    │   └── instinct-learning.md
    └── memory/              # Shared Memory
        ├── context/         #   Persistent Context (git 추적)
        ├── plans/           #   작업 계획
        ├── notepads/        #   작업 메모
        ├── decisions/       #   결정 사항
        ├── artifacts/       #   산출물
        └── reports/         #   분석 보고서
```

---

## 에이전트 (15개 네이티브 서브에이전트)

각 에이전트는 `.claude/agents/{name}.md`에 YAML frontmatter로 정의됩니다.
Claude Code가 모델 라우팅, 도구 제한, 스킬 주입을 자동 처리합니다.

| 카테고리 | 에이전트 | 역할 | 모델 |
|----------|----------|------|------|
| 기획 | pm | PRD, 유저 스토리 | inherit |
| 분석 | researcher, analyst | 코드 분석, 요구사항 | haiku |
| 설계 | planner, designer | 작업 분해, UI/UX 스펙 | inherit |
| 실행 | executor | 범용 실행 | haiku |
| 실행 | sisyphus | 자율 실행 (분석→구현→검증 올인원) | inherit |
| 실행 | frontend, backend, ai-server, dba | 전문 구현 | inherit |
| 검증 | architect, code-reviewer | 아키텍처/코드 리뷰 (읽기전용) | opus |
| 검증 | unit-tester | 유닛 테스트 ⚡자동 | haiku |
| 검증 | integration-tester | E2E 테스트 | inherit |

### Agent Teams (실험적)

3개 이상 에이전트가 동시 작업하고 에이전트 간 소통이 필요한 경우,
Agent Teams로 공유 태스크 리스트 기반 자율 협업이 가능합니다.
기본값은 일반 서브에이전트 병렬 호출입니다.

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
| workflow-state.md | 태스크 그래프 상태, 재시도 카운터, 호출 수 추적 |
| git checkpoint | 에이전트 완료 시 자동 커밋, 실패 시 롤백 |
| max_turns | 분석:15, 구현:25, 검증:10 |
| 비용 가드 | 총 에이전트 15회, 피드백 루프 3회 한도 |
| 병렬 안전 | 에이전트별 파일 범위 명시, 공유 파일 순차 |
| 드리프트 감지 | 세션 시작 시 tech-stack.md vs 실제 코드 비교 |

---

## 핵심 원칙

1. **직접 실행 우선**: 간단한 작업은 에이전트 없이 직접 처리
2. **병렬 최대화**: 독립 작업은 동시 실행
3. **검증 필수**: 구현 후 반드시 테스트/리뷰
4. **증거 기반**: 완료 전 실제 빌드/테스트 결과 확인
5. **모호성 제거**: 불명확하면 추측 대신 질문
