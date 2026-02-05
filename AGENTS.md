# Multi-Agent Development Team

웹 서비스 개발을 위한 14개 전문 에이전트 시스템입니다.
Claude Code의 Task tool로 실행되며, CLAUDE.md의 오케스트레이터가 조율합니다.

---

## 에이전트 구조

```
                    ┌──────────────────────┐
                    │   Master (CLAUDE.md) │
                    └──────────────────────┘
                                │
     ┌───────────────┬──────────┼──────────┬───────────────┐
     ▼               ▼          ▼          ▼               ▼
┌─────────┐   ┌──────────┐ ┌────────┐ ┌──────────┐ ┌────────────┐
│ PRODUCT │   │ PLANNING │ │ DESIGN │ │EXECUTION │ │VERIFICATION│
└─────────┘   └──────────┘ └────────┘ └──────────┘ └────────────┘
 pm            planner       designer   executor     architect
               researcher               frontend     code-reviewer
               analyst                  backend      unit-tester ⚡
                                        ai-server    integration-tester
                                        dba
```

---

## 에이전트 목록

### 기획/분석
| 에이전트 | 역할 | 도구 | max_turns |
|----------|------|------|-----------|
| **pm** | PRD, 유저 스토리, 우선순위 | Read, Write | 15 |
| **planner** | 작업 분해, 의존성 분석, 파일 영향 범위 | Read, Glob, Grep | 15 |
| **researcher** | 코드베이스 탐색, 기술 조사 | Read, Glob, Grep, WebSearch | 15 |
| **analyst** | 요구사항 분석, 엣지케이스 | Read, Glob, Grep | 15 |
| **designer** | 디자인 시스템, 컴포넌트 스펙 | Read, Write | 15 |

### 실행
| 에이전트 | 역할 | 도구 | max_turns |
|----------|------|------|-----------|
| **executor** | 범용 실행, 간단한 작업 | 전체 | 25 |
| **frontend** | React/Next.js, CSS, UI | 전체 | 25 |
| **backend** | API, 비즈니스 로직, 인증 | 전체 | 25 |
| **ai-server** | ML 서버, 모델 서빙 | 전체 | 25 |
| **dba** | DB 스키마, 마이그레이션, 쿼리 | 전체 | 25 |

### 검증
| 에이전트 | 역할 | 도구 | 실행 조건 | max_turns |
|----------|------|------|-----------|-----------|
| **architect** | 아키텍처 검토 | Read 전용 | 파일 5개+ 변경시 | 10 |
| **code-reviewer** | 코드 품질, 보안 | Read 전용 | 구현 후 자동 | 10 |
| **unit-tester** | 유닛 테스트 작성/실행 | 전체 | ⚡ 구현 직후 자동 | 10 |
| **integration-tester** | 통합/E2E 테스트 | 전체 | 명시적 요청시 | 10 |

---

## 에이전트 호출 방식

오케스트레이터가 Task tool로 에이전트를 spawn합니다:

```javascript
Task({
  subagent_type: "general-purpose",
  max_turns: /* 역할별 */,
  prompt: `
${agents/{name}.md 내용}
${agents/_common.md 공통 규칙}
${Persistent Context}
${작업 지시}
${산출물 포맷 (output-contracts.md)}
`
})
```

- 독립 작업은 **병렬** 실행 (하나의 메시지에서 여러 Task)
- 의존 작업은 **순차** 실행 (이전 산출물을 다음에 전달)
- 병렬 시 **파일 범위 분리** 필수 (공유 파일은 순차)

---

## Shared Memory (.omc/)

```
.omc/
├── context/              # Persistent (세션 간 유지, git 추적)
│   ├── preferences.md    #   사용자 선호도
│   ├── tech-stack.md     #   기술 스택
│   ├── conventions.md    #   코딩 컨벤션
│   ├── project-state.md  #   프로젝트 진행 상태
│   └── codebase.md       #   코드베이스 분석 (세션별)
├── workflow-state.md     # 워크플로우 실행 상태 (런타임)
├── plans/                # planner → 구현 에이전트
├── notepads/             # append 전용
├── decisions/            # architect, reviewer → 오케스트레이터
├── artifacts/            # pm, designer → planner
└── reports/              # 분석 보고서
```

**규칙**: Persistent Context는 오케스트레이터만 업데이트. 에이전트는 읽기만.

---

## 관련 파일

| 파일 | 역할 |
|------|------|
| `CLAUDE.md` | 오케스트레이터 프롬프트 (메인 진입점) |
| `agents/_common.md` | 에이전트 공통 규칙 |
| `agents/_template.md` | 새 에이전트 작성 템플릿 |
| `references/output-contracts.md` | 산출물 필수 포맷 |
| `references/error-recovery.md` | 에러 유형별 복구 절차 |
| `references/session-management.md` | 세션 컨텍스트 관리 |
| `references/external-integration.md` | 외부 도구 연동 |
| `references/persistent-memory-examples.md` | PM 작성 예시 |
