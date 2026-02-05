# Command: autopilot

## 설명
전체 워크플로우를 자동으로 실행합니다.
분석 → 계획 → 구현 → 검증 사이클을 자율적으로 진행합니다.

---

## 사용법
```
autopilot [요청]
```

예시:
```
autopilot 로그인 기능 구현해줘
autopilot 게시판 CRUD 만들어줘
```

---

## 동작

### 1단계: 분석
```
[researcher] 코드베이스 분석
[analyst] 요구사항 도출
```

### 2단계: 계획
```
[planner] 작업 계획 수립 → .omc/plans/current.md
```

### 3단계: 구현
```
[frontend/backend/dba/ai-server] 병렬 실행
```

### 4단계: 검증
```
[unit-tester] 유닛 테스트 ⚡ 자동
[code-reviewer] 코드 리뷰
[architect] 아키텍처 검토 (대규모 변경시)
```

### 5단계: 반복
```
검증 실패시 → 해당 단계 재실행
모든 검증 통과시 → 완료 보고
```

---

## 중단 조건

- 3회 연속 같은 오류 발생
- 명확한 요구사항 부족 (사용자 질문 필요)
- Critical 보안 이슈 발견

---

## 옵션

### --dry-run
실제 실행 없이 계획만 생성
```
autopilot --dry-run 로그인 기능 구현
```

### --skip-tests
테스트 단계 생략 (권장하지 않음)
```
autopilot --skip-tests 간단한 버그 수정
```

### --verbose
상세 로그 출력
```
autopilot --verbose 복잡한 기능 구현
```
