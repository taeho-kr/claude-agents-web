# Command: ralph

## 설명

영속 루프 모드. 작업이 완료될 때까지 sisyphus 에이전트를 반복 호출합니다.
각 반복은 전체 워크플로우(분석→설계→구현→검증)를 수행합니다.
최대 50회 반복. 반복 간 상태는 loop-state.md에 영속화됩니다.

---

## 사용법

```
ralph [요청]
ralph [옵션] [요청]
```

예시:
```
ralph 로그인 기능 구현해줘
ralph --max-iterations=10 버그 수정
ralph --completion="모든 테스트 통과 + 빌드 성공" API 리팩토링
ralph --resume
```

---

## 실행 프로토콜

### 시작

```
1. .claude/memory/loop-state.md 생성
2. Persistent Context 로드 (tech-stack, conventions, preferences)
3. 완료 기준 결정:
   - --completion 옵션 지정됨 → 그대로 사용
   - 미지정 → "모든 요구사항 구현 + 테스트 통과 + 빌드 성공"
4. git commit "[ralph] start: {요청 요약}"
```

### 반복 루프

```
for iteration in 1..max_iterations:

  #### 1. 이전 반복 컨텍스트 구성
  if iteration > 1:
    Read(".claude/memory/loop-state.md")
    이전 반복의 미완료 사항, 실패 내용을 컨텍스트에 포함

  #### 2. Sisyphus 호출
  Task({
    subagent_type: "sisyphus",
    prompt: `
      ## Persistent Context
      ${tech-stack, conventions, preferences}

      ## 현재 작업
      ### 요청
      ${사용자 요청}

      ### 반복 정보
      - 반복: ${iteration} / ${max_iterations}
      - 완료 기준: ${completion_criteria}

      ### 이전 반복 결과 (iteration > 1)
      ${이전 반복의 완료 보고}
      ${미완료 사항 목록}
      ${이전에 발생한 에러/실패 내용}

      ### 지시
      위 요청을 완수하세요.
      분석→구현→검증을 모두 수행하고, 완료 보고를 작성하세요.
      미완료 항목이 있으면 명확히 기술하세요.
    `,
    description: "sisyphus: iteration ${iteration} - ${요약}"
  })

  #### 3. 결과 평가
  - sisyphus 완료 보고에서 상태 확인 (✅/⚠️/❌)
  - loop-state.md 업데이트:
    - 반복 기록 테이블에 결과 추가
    - 미완료 사항 갱신
    - 연속 실패 카운터 갱신
  - git commit "[ralph] iteration ${iteration}: ${결과 요약}"

  #### 4. 완료 판단
  if sisyphus 상태 == ✅ 완료:
    → 완료 기준 충족 여부 최종 확인
    → 충족 → 성공 종료

  if iteration == max_iterations:
    → 한도 도달, 사용자 보고

  if 연속 실패 카운터 >= 3:
    → 자동 중단, 사용자 보고

  else:
    → 다음 반복
```

### 종료

```
성공 완료:
  → loop-state.md 삭제
  → project-state.md 업데이트
  → git commit "[ralph] complete: {기능 요약}"
  → 완료 보고

한도 도달:
  → loop-state.md 유지 (재개 가능)
  → 사용자에게 보고:
    "50회 반복 후에도 미완료. 남은 항목: {미완료 목록}"

자동 중단 (연속 실패):
  → loop-state.md 유지
  → 사용자에게 보고:
    "3회 연속 같은 이유({이유})로 실패. 다른 접근법이 필요합니다."

사용자 중단:
  → loop-state.md 유지 (재개 가능)
```

---

## 세션 재개

이전 세션에서 중단된 경우:

```
1. loop-state.md 존재 확인
2. 사용자에게 확인:
   "이전 ralph 세션이 발견되었습니다.
    요청: {request}
    진행: {current_iteration}/{max_iterations}
    재개할까요?"
3. 승인 → 마지막 반복 + 1부터 재개
4. 거부 → loop-state.md 삭제, 새로 시작
```

`ralph --resume`으로 확인 없이 즉시 재개 가능.

---

## 옵션

### --max-iterations=N (기본: 50)
최대 반복 횟수. 범위: 1~50.
```
ralph --max-iterations=10 간단한 버그 수정
```

### --completion="조건"
자연어 완료 기준. 매 반복 후 이 기준으로 평가.
```
ralph --completion="E2E 테스트 통과 + Lighthouse 90점 이상" 성능 개선
```

### --resume
중단된 루프를 사용자 확인 없이 즉시 재개.
```
ralph --resume
```

---

## 중단 조건

| 조건 | 행동 | 근거 |
|------|------|------|
| 완료 기준 충족 | 성공 종료 | sisyphus 완료 보고 ✅ |
| max_iterations 도달 | 사용자 보고 + loop-state 유지 | 비용 가드 |
| 3회 연속 동일 실패 | 자동 중단 + 사용자 보고 | 진전 없음 감지 |
| Critical 보안 이슈 | 즉시 중단 | sisyphus 보고 |
| 사용자 개입 | 즉시 중단 | loop-state 유지 |

---

## Dynamic Dispatch vs ralph 선택 기준

| 상황 | 권장 | 이유 |
|------|------|------|
| 대규모 신규 기능 (PRD, 설계, DB, UI, API) | 일반 요청 | 전문 에이전트 깊이 필요 |
| 중간 규모 기능/리팩토링 | ralph | 빠른 반복, 단일 컨텍스트 효율 |
| 버그 수정, 성능 개선 | ralph | 집중 반복 적합 |
| 세션 간 연속 작업 필요 | ralph | loop-state 영속화 |
| UI/UX 디자인이 중요 | 일반 요청 | designer 에이전트 활용 |
| 아키텍처 검토 필수 | 일반 요청 | architect(opus) 활용 |
| "될 때까지" 완료 보장 필요 | ralph | 자동 반복 |

---

## 출력물

| 단계 | 산출물 | 위치 |
|------|--------|------|
| 전체 | 루프 상태 | .claude/memory/loop-state.md |
| 반복별 | git checkpoint | `[ralph] iteration N: 요약` |
| 완료 | 프로젝트 상태 갱신 | .claude/memory/context/project-state.md |

---

## 비용 가드

```
sisyphus 에이전트 max_turns: 50 (per iteration)
전체 반복 한도: 50회
연속 실패 한도: 3회

예상 최대 토큰:
  50 iterations × 50 turns = 2,500 turns (이론적 최대)
  실제: 대부분 5~10 iterations 내 완료 예상
```
