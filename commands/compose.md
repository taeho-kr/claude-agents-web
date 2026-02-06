# Command: compose

## 설명
에이전트를 자유롭게 조합하여 커스텀 파이프라인을 실행합니다.
autopilot의 고정 순서 대신, 원하는 에이전트만 원하는 순서로 실행할 수 있습니다.

---

## 사용법

```
compose [파이프라인]
```

### 파이프라인 문법

| 기호 | 의미 | 예시 |
|------|------|------|
| `→` 또는 `->` | 순차 실행 (앞이 끝나면 뒤 실행) | `researcher → planner` |
| `\|` | 병렬 실행 (동시 실행) | `frontend \| backend` |
| `( )` | 그룹핑 | `(frontend \| backend) → unit-tester` |

### 에이전트 지정

에이전트 이름 뒤에 `:`로 작업 내용을 지정합니다:

```
compose researcher:인증 코드 분석 → planner → backend:로그인 API → unit-tester
```

지정하지 않으면 사용자의 원본 요청을 전달합니다:

```
compose researcher → planner → backend → unit-tester
```

---

## 예시

### 분석만 실행
```
compose researcher → analyst
```
→ 코드베이스 분석 후 요구사항 도출만 수행

### 설계까지만
```
compose researcher → analyst → planner
```
→ 분석 후 계획 수립까지만 (구현 없음)

### 특정 에이전트만 병렬 실행
```
compose frontend:Button 컴포넌트 | backend:POST /api/posts | dba:posts 테이블
```
→ parallel 커맨드와 동일하지만 더 명시적

### 구현 후 검증까지
```
compose (frontend | backend) → unit-tester → code-reviewer
```
→ 프론트/백 병렬 구현 → 테스트 → 리뷰

### DB 우선 순차 실행
```
compose dba → backend → frontend → unit-tester
```
→ DB 스키마 먼저, 이후 순차적으로

### 리뷰 체인
```
compose code-reviewer → architect
```
→ 코드 리뷰 후 아키텍처 리뷰

### 전체 커스텀 파이프라인
```
compose researcher → planner → dba → (frontend | backend) → unit-tester → code-reviewer
```
→ autopilot과 유사하지만 에이전트를 직접 선택

---

## 동작 방식

### 1. 파이프라인 파싱
```
입력: "researcher → (frontend | backend) → unit-tester"

파싱 결과:
  Step 1: [researcher]          (순차)
  Step 2: [frontend, backend]   (병렬)
  Step 3: [unit-tester]         (순차)
```

### 2. 컨텍스트 전달
각 단계의 결과는 다음 단계의 컨텍스트로 전달됩니다:
- 이전 에이전트의 산출물 (.omc/ 파일)
- 이전 단계에서 생성/수정된 코드 파일

### 3. 실행
```
Step 1: Task(researcher, 작업)
         ↓ 완료 후
Step 2: Task(frontend, 작업) + Task(backend, 작업)  ← 동시 실행
         ↓ 모두 완료 후
Step 3: Task(unit-tester, 작업)
```

---

## Persistent Context 자동 로드

compose 실행 시 자동으로 로드되는 컨텍스트:
- `.omc/context/preferences.md` - 사용자 선호도
- `.omc/context/tech-stack.md` - 기술 스택
- `.omc/context/conventions.md` - 코딩 컨벤션
- `.omc/context/project-state.md` - 프로젝트 상태

---

## 주의사항

### 의존성 위반 감지
```
# ⚠️ 오케스트레이터가 경고:
compose frontend → dba
# "frontend가 DB 변경을 참조할 수 있습니다. dba → frontend 순서가 맞나요?"
```

### 검증 누락 경고
```
# ⚠️ 구현 에이전트 포함 시 unit-tester 없으면 경고:
compose backend:API 구현
# "unit-tester가 파이프라인에 없습니다. 추가할까요?"
```

### parallel 커맨드와의 차이

| | parallel | compose |
|--|---------|---------|
| 실행 | 병렬만 | 순차 + 병렬 혼합 |
| 에이전트 | 자동 할당 | 직접 지정 |
| 검증 | 별도 | 파이프라인에 포함 |
| 유연성 | 낮음 | 높음 |

---

## 에러 처리

### 에이전트 실패 시
```
Step N에서 에이전트 실패:
  → references/error-recovery.md 절차 따름
  → 같은 Step 재시도 (최대 2회)
  → 2회 실패 시 → 사용자에게 보고, 파이프라인 중단
```

### 병렬 Step 내 부분 실패
```
Step 2: [frontend, backend] 중 backend만 실패:
  → frontend 결과는 유지
  → backend만 재시도
  → 재시도 실패 시 → 사용자에게 보고
```

compose는 파이프라인 실행 시 항상 workflow-state.md를 생성합니다.
(생성/삭제 조건: `references/output-contracts.md`의 workflow-state 섹션 참조)
