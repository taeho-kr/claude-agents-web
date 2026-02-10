# Command: autopilot

## 설명
전체 워크플로우를 자동으로 실행합니다.
기획 → 분석 → 설계 → 구현 → 검증 사이클을 자율적으로 진행합니다.

---

## 사용법
```
autopilot [요청]
autopilot [옵션] [요청]
```

예시:
```
autopilot 로그인 기능 구현해줘
autopilot --with-prd 결제 시스템 만들어줘
autopilot --skip-design 버그 수정해줘
```

---

## 워크플로우

> 각 Phase 완료 시 `.claude/memory/workflow-state.md`를 업데이트합니다.

### 시작 전
```
1. .claude/memory/workflow-state.md 생성 (명령, 요청 요약, Phase 목록)
2. Persistent Context 로드 + 드리프트 감지
```

### Phase 0: 기획 (선택)
> `--with-prd` 옵션 사용시 실행

```
[pm] PRD 작성, 기능 명세, 우선순위 정의
     → .claude/memory/artifacts/prd.md
→ git commit "[autopilot] Phase 0: 기획 완료"
→ workflow-state.md 업데이트 (Phase 0 완료, commit 해시 기록)
```

### Phase 1: 분석
```
[researcher] 코드베이스 분석 (max_turns: 15)
             → .claude/memory/context/codebase.md
[analyst]    요구사항 도출, 엣지케이스 식별 (max_turns: 15)
             → .claude/memory/notepads/requirements.md
→ git commit "[autopilot] Phase 1: 분석 완료"
→ workflow-state.md 업데이트
```

### Phase 2: 설계
```
[planner]  작업 계획 수립, 의존성 분석 (max_turns: 15)
           → .claude/memory/plans/current.md
           ⚠️ planner는 파일 영향 범위를 명시해야 함 (병렬 안전)
[designer] UI/UX 스펙 정의 (UI 작업시) (max_turns: 15)
           → .claude/memory/artifacts/design-spec.md
→ git commit "[autopilot] Phase 2: 설계 완료"
→ workflow-state.md 업데이트
```

### Phase 3: 구현
```
[dba]       DB 스키마, 마이그레이션 (먼저 실행) (max_turns: 25)
[parallel]  독립 작업 병렬 실행 (파일 범위 겹침 없을 때만):
            ├── [frontend]  UI 컴포넌트 (max_turns: 25)
            ├── [backend]   API, 비즈니스 로직 (max_turns: 25)
            └── [ai-server] ML 기능 (해당시) (max_turns: 25)
            ⚠️ 공유 파일(types, shared, package.json) 수정 시 순차 실행
→ git commit "[autopilot] Phase 3: 구현 완료"
→ workflow-state.md 업데이트
```

### Phase 4: 검증 + 피드백 루프
```
[unit-tester]   유닛 테스트 ⚡ 자동 실행 (max_turns: 10)
[code-reviewer] 코드 품질, 보안 검토 (max_turns: 10)
[architect]     아키텍처 검토 (대규모 변경시) (max_turns: 10)

FAIL 시:
  → workflow-state.md 재시도 카운터 증가
  → 피드백 + 구현 에이전트 재호출
  → 재검증
  → 2회 실패 시 → 사용자 보고 (workflow-state.md에 기록)
```

### Phase 5: 완료
```
모든 검증 통과:
  → git commit "[autopilot] 완료: {기능 요약}"
  → project-state.md 업데이트
  → workflow-state.md 삭제
  → 완료 보고
```

---

## 의사결정 흐름

```
요청 수신
    │
    ├─ PRD 필요? ──yes──→ [pm] Phase 0
    │      │
    │     no
    │      ▼
    ├─→ [researcher + analyst] Phase 1
    │      │
    │      ▼
    ├─ UI 작업? ──yes──→ [designer] 포함
    │      │
    │     no
    │      ▼
    ├─→ [planner] Phase 2
    │      │
    │      ▼
    ├─ DB 변경? ──yes──→ [dba] 먼저 실행
    │      │
    │      ▼
    └─→ [실행 에이전트] Phase 3 → Phase 4 → 완료
```

---

## 옵션

### --with-prd
PRD 작성부터 시작 (새 기능, 큰 변경)
```
autopilot --with-prd 사용자 대시보드 만들어줘
```

### --skip-design
디자인 단계 생략 (백엔드 전용, 버그 수정)
```
autopilot --skip-design API 성능 개선
```

### --dry-run
실제 실행 없이 계획만 생성
```
autopilot --dry-run 로그인 기능 구현
```

### --skip-tests
테스트 단계 생략 (권장하지 않음)
```
autopilot --skip-tests 간단한 설정 변경
```

### --verbose
상세 로그 출력
```
autopilot --verbose 복잡한 기능 구현
```

---

## 중단 조건

| 조건 | 행동 | 근거 |
|------|------|------|
| 피드백 루프 2회 실패 | 사용자에게 보고 | workflow-state 재시도 카운터 |
| 총 에이전트 호출 15회 초과 | 사용자 확인 요청 | workflow-state 호출 기록 |
| 요구사항 불명확 | 사용자에게 질문 | - |
| Critical 보안 이슈 | 즉시 중단, 보고 | code-reviewer 결과 |
| 아키텍처 REJECTED | 사용자에게 대안 제시 | architect 결과 |

---

## 출력물

| Phase | 산출물 | 위치 |
|-------|--------|------|
| 전체 | 워크플로우 상태 | .claude/memory/workflow-state.md |
| 0 | PRD | .claude/memory/artifacts/prd.md |
| 1 | 코드베이스 분석 | .claude/memory/context/codebase.md |
| 1 | 요구사항 | .claude/memory/notepads/requirements.md |
| 2 | 작업 계획 | .claude/memory/plans/current.md |
| 2 | 디자인 스펙 | .claude/memory/artifacts/design-spec.md |
| 4 | 테스트 결과 | .claude/memory/notepads/unit-tests.md |
| 4 | 리뷰 결과 | .claude/memory/decisions/code-review.md |
| 0-3 | git checkpoint | Phase별 자동 커밋 |

## 롤백

Phase 실패 시 이전 checkpoint로 복원:
```
1. workflow-state.md에서 마지막 성공 Phase의 commit 해시 확인
2. git reset --hard {해시}
3. 해당 Phase부터 재실행
```
