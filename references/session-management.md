# Session Context Management (세션 내 컨텍스트 관리)

장시간 세션에서 컨텍스트 누적을 효율적으로 관리하는 규칙입니다.

---

## 세션 상태 관리

### .omc/workflow-state.md (워크플로우 실행 중)

에이전트 위임 워크플로우 실행 중 상태를 추적합니다.
포맷: `references/output-contracts.md`의 workflow-state 섹션 참조.

- 워크플로우 시작 시 생성, 종료 시 삭제
- Phase 진행, 에이전트 호출 기록, 재시도 카운터, 비용 가드 포함
- 세션이 끊어져도 이 파일로 워크플로우 복원 가능

### 에이전트별 작업 기록 (.omc/notepads/{agent}.md)

각 구현 에이전트는 자신의 이름으로 notepad에 작업 결과를 기록합니다.
포맷: `references/output-contracts.md`의 구현 에이전트 공통 형식 참조.

---

## 에이전트 호출 시 컨텍스트 선택

모든 .omc/ 파일을 매번 전달하면 토큰이 낭비됩니다.
에이전트 역할에 따라 필요한 컨텍스트만 선택합니다.

### 분석/기획 에이전트
```
필수: Persistent Context (tech-stack, conventions, preferences)
선택: 없음 (이 에이전트들이 컨텍스트를 생성하는 역할)
```

### 구현 에이전트 (frontend, backend, dba, ai-server, executor)
```
필수: Persistent Context
필수: .omc/plans/current.md (해당 에이전트 부분만 발췌)
선택: .omc/context/codebase.md (관련 섹션만)
선택: .omc/notepads/requirements.md (관련 요구사항만)
```

### 검증 에이전트 (unit-tester, code-reviewer, architect)
```
필수: Persistent Context
필수: 검증 대상 코드 파일 경로
선택: .omc/plans/current.md (의도 파악용)
선택: .omc/notepads/requirements.md (요구사항 대조용)
```

---

## 다중 기능 연속 구현 시

autopilot으로 여러 기능을 순차 구현할 때:

```
기능 A 완료
  → project-state.md 업데이트 (A 완료 기록)
  → workflow-state.md 삭제 또는 완료 표시

기능 B 시작
  → project-state.md 읽기 (A 완료 확인)
  → researcher: 기능 A가 만든 코드도 포함하여 분석
  → planner: A의 산출물과 충돌하지 않도록 계획
```

**핵심**: 각 기능 완료 시 `project-state.md`를 갱신하여 다음 기능의 에이전트가 현재 상태를 파악할 수 있게 합니다.

---

## 토큰 절약 규칙

1. **발췌 전달**: 긴 파일은 관련 섹션만 발췌하여 에이전트에게 전달
2. **요약 전달**: codebase.md가 200줄 이상이면 관련 부분만 요약
3. **점진적 로드**: 에이전트가 추가 정보를 요청하면 그때 제공 (에이전트 프롬프트에 "필요한 파일은 직접 Read하세요" 지시)
4. **Persistent Context 캐싱**: 동일 세션 내에서 Persistent Context는 한 번만 읽고 재사용
