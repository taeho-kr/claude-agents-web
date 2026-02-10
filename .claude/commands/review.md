# Command: review

## 설명
코드 리뷰 및 아키텍처 검토를 수행합니다.
구현 없이 분석과 피드백만 제공합니다.

---

## 사용법
```
review [대상]
```

예시:
```
review src/api/auth.ts
review src/components/
review 최근 변경사항
```

---

## 리뷰 유형

### 파일 리뷰
```
review src/api/auth.ts
```
→ 단일 파일의 코드 품질, 보안, 패턴 검토

### 디렉토리 리뷰
```
review src/components/
```
→ 전체 디렉토리의 구조, 일관성, 패턴 검토

### 변경사항 리뷰
```
review 최근 변경사항
```
→ git diff 기반 변경된 파일들 검토

### 아키텍처 리뷰
```
review architecture
```
→ 전체 프로젝트 구조 검토

---

## 에이전트 구성

```
[code-reviewer] 코드 품질, 컨벤션, 보안
[architect] 설계, 구조, 확장성 (대규모 리뷰시)
```

---

## 출력

### 코드 리뷰 결과
```markdown
# 코드 리뷰: src/api/auth.ts

## 요약
- 🔴 Critical: 1
- 🟡 Major: 2
- 🟢 Minor: 3

## 상세...
```

### 아키텍처 리뷰 결과
```markdown
# 아키텍처 리뷰

## 강점
- ...

## 개선점
- ...

## 권장사항
- ...
```

---

## 옵션

### --security
보안 중심 리뷰
```
review --security src/api/
```

### --performance
성능 중심 리뷰
```
review --performance src/services/
```

### --quick
빠른 리뷰 (주요 이슈만)
```
review --quick src/
```
