# Session Context Management (세션 내 컨텍스트 관리)

장시간 세션에서 컨텍스트 누적을 효율적으로 관리하는 규칙입니다.

---

## 세션 메모 관리

### .omc/notepads/session.md

세션 중 발생하는 모든 주요 이벤트를 기록합니다.

**기록 형식:**
```markdown
## [HH:MM] [에이전트] 작업명
- 결과: 성공/실패
- 생성 파일: path1, path2
- 변경 파일: path3
- 참고: 특이사항
```

**크기 관리:**
- 50줄 초과 시 → 완료된 작업은 요약으로 압축
- 압축 형식: `✅ [에이전트] 작업명 (생성: N파일, 변경: N파일)`
- 진행 중/실패 항목은 압축하지 않음

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
  → session.md에 A 결과 요약 추가

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
