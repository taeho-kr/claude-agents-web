# Multi-Agent Development Team

## 개요

웹 서비스 개발을 위한 다중 에이전트 시스템입니다.
Claude Code의 Task tool을 사용해 전문 에이전트를 병렬로 실행하고 조율합니다.

---

## 에이전트 구조

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         🎯 ORCHESTRATION                                 │
│                    ┌──────────────────────┐                             │
│                    │   Master (CLAUDE.md) │                             │
│                    └──────────────────────┘                             │
└─────────────────────────────────────────────────────────────────────────┘
                                 │
     ┌───────────────┬───────────┼───────────┬───────────────┐
     ▼               ▼           ▼           ▼               ▼
┌─────────┐   ┌───────────┐ ┌─────────┐ ┌───────────┐ ┌─────────────┐
│ PRODUCT │   │  PLANNING │ │ DESIGN  │ │ EXECUTION │ │ VERIFICATION│
└─────────┘   └───────────┘ └─────────┘ └───────────┘ └─────────────┘
 - pm          - planner     - designer  - executor    - architect
               - researcher               - frontend   - code-reviewer
               - analyst                  - backend    - unit-tester ⚡
                                          - ai-server  - integration-tester
                                          - dba
```

---

## 에이전트 목록

### 0. 제품 기획 (Product)

| 에이전트 | 역할 | 도구 권한 |
|----------|------|-----------|
| **pm** | PRD 작성, 유저 스토리, 우선순위 정의 | Read, Write, Glob, Grep |

### 1. 기획/분석 (Planning)

| 에이전트 | 역할 | 도구 권한 |
|----------|------|-----------|
| **planner** | 작업 분해, 단계 설계, 의존성 분석 | Read, Glob, Grep |
| **researcher** | 코드베이스 탐색, 패턴 분석, 기술 조사 | Read, Glob, Grep, WebSearch |
| **analyst** | 요구사항 분석, 엣지케이스 도출, 제약조건 식별 | Read, Glob, Grep |

### 1.5. 디자인 (Design)

| 에이전트 | 역할 | 도구 권한 |
|----------|------|-----------|
| **designer** | 디자인 시스템, 컴포넌트 스펙, 와이어프레임 | Read, Write, Glob, Grep |

### 2. 실행 (Execution)

| 에이전트 | 역할 | 도구 권한 |
|----------|------|-----------|
| **executor** | 범용 실행, 간단한 작업 직접 처리 | Read, Write, Edit, Bash |
| **frontend** | React/Vue/Next.js, CSS, UI 구현 | Read, Write, Edit, Bash |
| **backend** | API, 비즈니스 로직, 인증/인가 | Read, Write, Edit, Bash |
| **ai-server** | ML 서버, 모델 서빙, AI 파이프라인 | Read, Write, Edit, Bash |
| **dba** | DB 스키마, 마이그레이션, 쿼리 최적화 | Read, Write, Edit, Bash |

### 3. 검증 (Verification)

| 에이전트 | 역할 | 도구 권한 | 실행 조건 |
|----------|------|-----------|-----------|
| **architect** | 아키텍처 검토, 설계 검증 | Read, Glob, Grep (읽기 전용) | 요청시 |
| **code-reviewer** | 코드 품질, 보안 검토 | Read, Glob, Grep (읽기 전용) | 요청시 |
| **unit-tester** | 유닛 테스트 작성/실행 | Read, Write, Edit, Bash | ⚡ 구현 직후 자동 |
| **integration-tester** | 통합/E2E 테스트 | Read, Write, Edit, Bash | 명시적 요청시만 |

---

## 실행 모드

### autopilot
전체 워크플로우 자동 실행. 기획 → 실행 → 검증 순환.

### parallel
독립적인 작업을 여러 에이전트가 동시 실행.

### sequential
단계별 순차 실행. 각 단계 완료 후 다음으로 진행.

### focused
단일 에이전트가 특정 작업에 집중.

---

## 에이전트 호출 규칙

1. **Task tool 사용**: 에이전트는 `Task` tool로 spawn
2. **프롬프트 주입**: `agents/{agent-name}.md` 내용을 시스템 프롬프트에 포함
3. **병렬 실행**: 독립 작업은 동시에 여러 Task 호출
4. **결과 수집**: 모든 에이전트 완료 후 Master가 종합

---

## 워크플로우 예시

```
User: "로그인 기능 구현해줘"

1. [planner] 작업 분해
   - DB 스키마 설계
   - API 엔드포인트 구현
   - 프론트엔드 폼 구현
   - 테스트 작성

2. [researcher] 기존 코드 분석
   - 인증 관련 기존 코드 탐색
   - 사용 중인 라이브러리 확인

3. [parallel] 구현
   - [dba] users 테이블, sessions 테이블 생성
   - [backend] /auth/login, /auth/logout API
   - [frontend] LoginForm 컴포넌트

4. [unit-tester] 유닛 테스트 ⚡

5. [architect] 최종 검토
```

---

## Shared Memory 개념

에이전트 간 정보 공유를 위해 `.omc/` 디렉토리 사용:

```
.omc/
├── plans/           # 작업 계획 (planner 작성, 다른 에이전트 참조)
├── notepads/        # 작업 중 메모 (각 에이전트가 append)
├── decisions/       # 주요 결정 사항 기록
└── artifacts/       # 생성된 산출물 목록
```

- **plans/**: 읽기 전용 (planner만 작성)
- **notepads/**: append 전용 (수정 불가, 추가만 가능)
- **decisions/**: architect/code-reviewer가 작성
- **artifacts/**: 실행 에이전트가 작성

---

## 메모리 전략 (LSTM 개념 적용)

### Forget Gate
오래되거나 무관한 정보 정리:
- 완료된 태스크의 상세 로그 압축
- 이전 세션의 임시 메모 정리

### Input Gate
새 정보 저장 여부 결정:
- 중요한 결정 사항 → decisions/에 기록
- 일시적 작업 내용 → notepads/에 임시 기록

### Output Gate
에이전트별 관련 정보만 제공:
- frontend 에이전트 → UI 관련 결정만 로드
- backend 에이전트 → API/DB 관련 결정만 로드

---

## 캐시 전략 (Multi-Level)

### L1: 현재 태스크
현재 작업 중인 파일 목록, 직전 변경 사항

### L2: 현재 세션
이번 세션에서 분석한 코드베이스 구조, 결정 사항

### L3: 프로젝트
프로젝트 컨벤션, 기술 스택, 주요 패턴

### L4: 글로벌
사용자 선호도, 반복 패턴, 지양 사항
