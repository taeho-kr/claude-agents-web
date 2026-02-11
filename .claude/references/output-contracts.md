# Output Contracts (산출물 포맷 계약)

에이전트 간 산출물의 필수 구조를 정의합니다.
다음 단계 에이전트가 파싱할 수 있도록 포맷을 준수해야 합니다.

---

## .claude/memory/context/codebase.md (researcher → 전체)

```markdown
# 코드베이스 분석

## 프로젝트 구조
<!-- 디렉토리 트리 (depth 2) -->

## 기술 스택
<!-- 프레임워크, 언어, 주요 라이브러리, 버전 -->

## 컨벤션
<!-- 네이밍, 파일 구조 패턴, 상태 관리, API 패턴 -->

## 관련 파일
<!-- 현재 작업과 관련된 기존 코드 경로 + 1줄 설명 -->

## 재사용 가능
<!-- 기존 컴포넌트/훅/유틸 중 활용 가능한 것 -->

## 주의사항
<!-- 현재 코드의 제약, 기술 부채, 알려진 이슈 -->
```

---

## .claude/memory/notepads/requirements.md (analyst → planner, 구현 에이전트)

```markdown
# 요구사항 분석

## 기능 요구사항
<!-- 필수(Must), 권장(Should), 선택(Could) 구분 -->
### Must
- [ ] 항목
### Should
- [ ] 항목
### Could
- [ ] 항목

## 비기능 요구사항
<!-- 성능, 보안, 접근성 등 -->

## 엣지케이스
<!-- 예외 상황, 경계값, 동시성 이슈 -->

## 제약 조건
<!-- 기술적/비즈니스 제약 -->

## 미결 사항
<!-- 사용자 확인이 필요한 항목 -->
```

---

## .claude/memory/plans/current.md (planner → 구현 에이전트)

> XML 구조화 태스크: 각 task에 검증 명령과 완료 기준을 내장합니다.

```markdown
# 작업 계획: [제목]

## 목표
<!-- 1-2문장 -->

## 단계

### Phase 1: [이름] (병렬/순차)

<task agent="[에이전트명]" type="auto">
  <name>태스크 제목</name>
  <files>생성/수정할 파일 경로</files>
  <action>구체적인 구현 지시</action>
  <verify>실행 가능한 검증 명령어 (빌드, 테스트, curl 등)</verify>
  <done>완료 판단 기준 (사람이 읽을 수 있는 형태)</done>
</task>

### Phase N: 검증

<task agent="unit-tester" type="auto">
  <name>유닛 테스트</name>
  <files>테스트 파일 경로</files>
  <action>테스트 대상 명시</action>
  <verify>테스트 실행 명령어</verify>
  <done>전체 통과, 커버리지 기준</done>
</task>

## 파일 영향 범위
<!-- 에이전트별 수정 가능 범위 (병렬 안전) -->
| 에이전트 | 파일 범위 |
|----------|----------|
| [agent1] | path/pattern/** |
| [agent2] | path/pattern/** |

## 공유 파일 (순차 실행 필수)
<!-- 두 에이전트 이상이 수정할 수 있는 파일 → 실행 순서 명시 -->
```

### task 요소 설명

| 속성 | 설명 |
|------|------|
| `agent` | 실행 에이전트 |
| `type` | `auto` (자동 검증) / `manual` (수동 확인 필요) |
| `<name>` | 태스크 제목 |
| `<files>` | 생성/수정 대상 파일 |
| `<action>` | 구체적인 구현 지시 |
| `<verify>` | 실행 가능한 검증 명령어 |
| `<done>` | 완료 판단 기준 |

---

## .claude/memory/decisions/code-review.md (code-reviewer → 오케스트레이터)

```markdown
# 코드 리뷰 결과

## 요약
<!-- PASS / FAIL / CONDITIONAL PASS -->
<!-- Critical: N개, Major: N개, Minor: N개 -->

## Critical (즉시 수정 필수)
### [번호]. [제목]
- **파일**: path:line
- **문제**: 구체적 설명
- **수정안**: 코드 또는 방법 제시

## Major (수정 권장)
### [번호]. [제목]
- **파일**: path:line
- **문제**: 구체적 설명
- **수정안**: 코드 또는 방법 제시

## Minor (개선 제안)
- 항목 나열

## 긍정적 사항
- 잘된 점 나열
```

---

## .claude/memory/decisions/architecture-review.md (architect → 오케스트레이터)

```markdown
# 아키텍처 리뷰 결과

## 요약
<!-- APPROVED / NEEDS_REVISION / REJECTED -->

## 구조 평가
<!-- 현재 구조의 적절성 -->

## 확장성
<!-- 향후 변경 대응 가능성 -->

## 위험 요소
### [번호]. [제목]
- **영향**: 구체적 설명
- **권장사항**: 대안 제시

## 승인 조건
<!-- NEEDS_REVISION인 경우, 수정 후 승인 가능 조건 -->
```

---

## .claude/memory/artifacts/prd.md (pm → planner, designer)

```markdown
# PRD: [제품/기능명]

## 개요
<!-- 한 문단으로 요약 -->

## 목표
<!-- 정량적 목표 포함 -->

## 사용자 스토리
### [페르소나] 로서 [행동] 을 하여 [가치] 를 얻는다
- 인수 조건:
  - [ ] 조건1
  - [ ] 조건2

## 기능 명세
### [기능명]
- 설명:
- 입력:
- 출력:
- 예외:

## 우선순위
| 기능 | 우선순위 | 근거 |
|------|----------|------|

## 범위 제외
<!-- 이번에 하지 않는 것 명시 -->
```

---

## .claude/memory/artifacts/design-spec.md (designer → planner, frontend)

```markdown
# 디자인 스펙: [기능명]

## 디자인 토큰
<!-- 기존 시스템 참조 또는 새로 정의 -->
### 색상
- primary: #6366F1
- secondary: ...
### 타이포그래피
| Name | Size | Weight | Usage |
|------|------|--------|-------|
### 간격
- xs: 4px, sm: 8px, md: 16px, lg: 24px

## 컴포넌트 스펙
### [컴포넌트명]
- **Variants**: primary, secondary, ghost
- **Sizes**: sm, md, lg
- **States**: default, hover, active, disabled
- **Props**: variant, size, disabled, onClick
- **접근성**: role, aria-*, 키보드

## 화면 구조
### [화면명]
- **레이아웃**: 구조 설명 (텍스트 와이어프레임 가능)
- **컴포넌트 목록**: 이름, 역할, 위치
- **상호작용**: 클릭/호버/입력 시 동작

## 반응형
<!-- 브레이크포인트별 레이아웃 변경 -->
- Desktop (>1024px): ...
- Tablet (768-1024px): ...
- Mobile (<768px): ...

## 상태별 UI
<!-- 로딩, 비어있음, 에러, 성공 -->

## 사용자 흐름 (해당시)
<!-- 주요 인터랙션 시퀀스 -->
```

---

## .claude/memory/notepads/{agent}.md (구현 에이전트 공통 형식)

> frontend, backend, dba, ai-server, executor 각각 자신의 이름으로 작성합니다.

```markdown
## [작업명]

### 생성/수정 파일
- path/to/file.ts (신규/수정)

### 사용 라이브러리
- 라이브러리명 (용도)

### 검증 결과
- `빌드 명령어` ✅/❌
- `테스트 명령어` ✅/❌

### 특이사항
- 기존 코드 재사용, 주의사항 등

### 미결 사항
- 없음 / 항목 나열
```

---

## .claude/memory/notepads/integration-tests.md (integration-tester → 오케스트레이터)

```markdown
# 통합 테스트 결과

## 요약
- 실행: N개
- 성공: N개
- 실패: N개

## 테스트 환경
- DB: [종류] ([환경])
- 외부 API: [서비스] ([sandbox/mock])

## 테스트 시나리오
| 시나리오 | 결과 | 비고 |
|----------|------|------|

## 실패 상세 (있을 경우)
### [시나리오명]
- **단계**: 어디서 실패
- **기대**: ...
- **실제**: ...
- **원인 추정**: ...

## 정리
- 테스트 데이터 삭제: ✅/❌
- 연결 종료: ✅/❌
```

---

## .claude/memory/notepads/unit-tests.md (unit-tester → code-reviewer)

```markdown
# 유닛 테스트 결과

## 요약
- 실행: N개
- 성공: N개
- 실패: N개
- 커버리지: N%

## 테스트 파일
| 파일 | 테스트 수 | 결과 |
|------|----------|------|

## 실패 상세 (있을 경우)
### [테스트명]
- **파일**: path:line
- **기대값**: ...
- **실제값**: ...
- **원인 추정**: ...
```

---

## .claude/memory/workflow-state.md (오케스트레이터 전용)

> 오케스트레이터가 매 Phase 전환 시 업데이트합니다.
> 에이전트는 이 파일을 읽지 않습니다.

### 생성 조건

| 명령 | 생성 여부 | 조건 |
|------|-----------|------|
| `autopilot` | ✅ 항상 | 다단계 워크플로우 실행 |
| `compose` | ✅ 항상 | 파이프라인에 에이전트 포함 |
| `parallel` | ✅ 항상 | 여러 에이전트 동시 실행 |
| 단일 에이전트 직접 호출 | ❌ | 워크플로우가 아님 |
| 오케스트레이터 직접 실행 | ❌ | 에이전트 위임 없음 |

### 삭제 조건

- 워크플로우 정상 완료 시 삭제
- 사용자가 명시적으로 취소 시 삭제
- 실패로 중단 시 유지 (복구용)

```markdown
# Workflow State

## 현재 실행
- **명령**: autopilot / compose / parallel
- **요청**: [사용자의 원래 요청 1줄 요약]
- **시작**: [타임스탬프 또는 세션 식별]

## Phase 진행
- [x] Phase 1: 분석 (commit: abc1234)
- [x] Phase 2: 설계 (commit: def5678)
- [ ] Phase 3: 구현 ← 현재
- [ ] Phase 4: 검증

## 에이전트 호출 기록
| # | 에이전트 | 작업 | 결과 | max_turns |
|---|----------|------|------|-----------|
| 1 | researcher | 코드베이스 분석 | 완료 | 15 |
| 2 | analyst | 요구사항 도출 | 완료 | 15 |
| 3 | planner | 작업 계획 | 완료 | 15 |
| 4 | frontend | UI 구현 | 진행중 | 25 |

## 재시도 카운터
<!-- 같은 에이전트+같은 이유로 재호출된 횟수 -->
| 에이전트 | 사유 | 횟수 | 한도 |
|----------|------|------|------|
| frontend | code-review Critical | 1 | 2 |

## 비용 가드
- **총 에이전트 호출**: 4 / 15
- **피드백 루프 횟수**: 0 / 3
- **한도 초과 시**: 사용자 확인 요청

## 롤백 포인트
<!-- Phase 완료 시 자동 커밋된 해시 -->
| Phase | Commit | 복원 명령 |
|-------|--------|-----------|
| Phase 1 | abc1234 | git reset --hard abc1234 |
| Phase 2 | def5678 | git reset --hard def5678 |
```

---

## .claude/memory/loop-state.md (ralph 명령 전용)

> ralph 명령 실행 시 생성. sisyphus 반복 호출의 상태를 추적합니다.
> 세션 간 영속화되며, --resume으로 재개 가능합니다.

### 생성 조건

| 명령 | 생성 여부 | 조건 |
|------|-----------|------|
| `ralph` | ✅ 항상 | 영속 루프 실행 |
| 기타 | ❌ | ralph 전용 |

### 삭제 조건

- 워크플로우 정상 완료 시 삭제
- 사용자가 명시적으로 취소 시 삭제
- 한도 도달/연속 실패 시 유지 (재개용)

```markdown
# Loop State

## 실행 정보
- **command**: ralph
- **request**: [사용자 요청 1줄 요약]
- **completion_criteria**: [완료 기준]
- **max_iterations**: 50
- **start**: [타임스탬프]
- **last_update**: [타임스탬프]

## 진행 상태
- **current_iteration**: 3
- **status**: in_progress / completed / failed / paused

## 반복 기록
| # | 결과 | 변경 파일 수 | 미완료 사항 | commit |
|---|------|-------------|------------|--------|
| 1 | partial | 5 | 테스트 미작성 | abc123 |
| 2 | partial | 3 | 2개 테스트 실패 | def456 |
| 3 | in_progress | - | - | - |

## 마지막 미완료 사항
- [ ] 항목1
- [ ] 항목2

## 연속 실패 카운터
- **같은 이유 연속 실패**: 0 / 3 (3회 도달 시 자동 중단)
- **마지막 실패 이유**: -
```

---

## .claude/memory/notepads/instincts.md (오케스트레이터 전용)

> 세션에서 관찰된 패턴을 신뢰도 점수와 함께 기록합니다.
> 상세 규칙: `.claude/references/instinct-learning.md`

```markdown
# Instinct 후보

## 코딩 스타일
- [0.3] 패턴 설명 (YYYY-MM-DD 관찰)
- [0.6] 패턴 설명 (YYYY-MM-DD, YYYY-MM-DD 관찰)
- [0.9] 패턴 설명 (YYYY-MM-DD 사용자 명시) → 반영됨

## 기술 선택
- [점수] 패턴 설명 (관찰 이력)

## 워크플로우
- [점수] 패턴 설명 (관찰 이력)

## 커뮤니케이션
- [점수] 패턴 설명 (관찰 이력)
```

### 점수 기준

| 점수 | 의미 | 동작 |
|------|------|------|
| 0.3 | 1회 관찰 (후보) | notepads에만 기록 |
| 0.6 | 2회 관찰 (유력) | Persistent Context 반영 검토 |
| 0.9 | 3회+ 또는 사용자 명시 (확정) | Persistent Context 확정 반영 |
