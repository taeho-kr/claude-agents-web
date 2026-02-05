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

### Phase 0: 기획 (선택)
> `--with-prd` 옵션 사용시 실행

```
[pm] PRD 작성, 기능 명세, 우선순위 정의
     → .omc/artifacts/prd.md
```

### Phase 1: 분석
```
[researcher] 코드베이스 분석
             → .omc/context/codebase.md
[analyst]    요구사항 도출, 엣지케이스 식별
             → .omc/notepads/requirements.md
```

### Phase 2: 설계
```
[planner]  작업 계획 수립, 의존성 분석
           → .omc/plans/current.md
[designer] UI/UX 스펙 정의 (UI 작업시)
           → .omc/artifacts/design-spec.md
```

### Phase 3: 구현
```
[dba]       DB 스키마, 마이그레이션 (먼저 실행)
[parallel]  독립 작업 병렬 실행:
            ├── [frontend]  UI 컴포넌트
            ├── [backend]   API, 비즈니스 로직
            └── [ai-server] ML 기능 (해당시)
```

### Phase 4: 검증
```
[unit-tester]   유닛 테스트 ⚡ 자동 실행
[code-reviewer] 코드 품질, 보안 검토
[architect]     아키텍처 검토 (대규모 변경시)
```

### Phase 5: 반복/완료
```
검증 실패 → 해당 Phase 재실행 (최대 2회)
모든 검증 통과 → 완료 보고
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

| 조건 | 행동 |
|------|------|
| 3회 연속 같은 오류 | 사용자에게 질문 |
| 요구사항 불명확 | 사용자에게 질문 |
| Critical 보안 이슈 | 즉시 중단, 보고 |
| 아키텍처 변경 필요 | architect 승인 요청 |

---

## 출력물

| Phase | 산출물 | 위치 |
|-------|--------|------|
| 0 | PRD | .omc/artifacts/prd.md |
| 1 | 코드베이스 분석 | .omc/context/codebase.md |
| 1 | 요구사항 | .omc/notepads/requirements.md |
| 2 | 작업 계획 | .omc/plans/current.md |
| 2 | 디자인 스펙 | .omc/artifacts/design-spec.md |
| 4 | 테스트 결과 | .omc/notepads/test-results.md |
| 4 | 리뷰 결과 | .omc/decisions/review.md |
