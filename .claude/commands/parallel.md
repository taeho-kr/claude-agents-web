# Command: parallel

## 설명
여러 독립적인 작업을 동시에 실행합니다.
각 작업은 별도의 에이전트에서 병렬로 처리됩니다.

---

## 사용법
```
parallel [작업1] | [작업2] | [작업3]
```

예시:
```
parallel LoginForm 구현 | /auth/login API 구현 | users 테이블 수정
```

---

## 동작

1. 작업을 `|` 로 분리
2. 각 작업에 적합한 에이전트 자동 할당
3. 모든 에이전트 동시 실행
4. 모든 작업 완료 후 결과 종합

---

## 자동 에이전트 할당

| 키워드 | 에이전트 |
|--------|----------|
| 컴포넌트, Form, UI, 페이지 | frontend |
| API, 엔드포인트, 라우트 | backend |
| 테이블, 스키마, 마이그레이션 | dba |
| 모델, ML, 추론 | ai-server |
| 테스트 | unit-tester |
| 그 외 | executor |

---

## 안전 정책

### 파일 범위 분리 (필수)

병렬 실행 전, 오케스트레이터가 각 에이전트의 수정 가능 파일 범위를 확인합니다.
planner의 작업 계획(.claude/memory/plans/current.md)에 명시된 파일 범위를 기준으로 합니다.

**기본 원칙:**
```
[frontend] UI 컴포넌트, 페이지, 훅, 스타일 파일
[backend]  API 라우트, 서비스, 미들웨어 파일
[dba]      스키마, 마이그레이션, DB 유틸 파일
[ai-server] ML 서비스, 모델 관련 파일
```

**공유 파일 (병렬 금지)**:
```
타입 정의, 공유 유틸, 패키지 설정, 환경변수 등
→ 한 에이전트가 먼저 수정한 후 다음 에이전트 실행
```

### 의존성 있는 작업
의존성이 있으면 parallel 대신 순차 실행:
```
# ❌ 잘못된 사용 (DB가 먼저 필요)
parallel users 테이블 생성 | 로그인 API 구현

# ✅ 올바른 사용
먼저 users 테이블 생성하고, 그 다음 로그인 API 구현해줘
```

### 같은 파일 수정
동일 파일을 수정하는 작업은 충돌 발생:
```
# ❌ 충돌 가능
parallel index.ts에 A 함수 추가 | index.ts에 B 함수 추가

# ✅ 순차 실행 필요
index.ts에 A 함수와 B 함수 추가해줘
```

### 충돌 감지 (사후)
병렬 완료 후 오케스트레이터가 `git diff`로 변경 파일 확인:
- 예상 범위 밖 파일이 수정됨 → 사용자에게 경고
- 같은 파일이 여러 에이전트에 의해 수정됨 → 수동 확인 요청

---

## 결과 형식

```markdown
## Parallel 실행 결과

### ✅ frontend (LoginForm 구현)
- 생성: src/components/LoginForm.tsx
- 시간: 2.3s

### ✅ backend (/auth/login API)
- 생성: src/api/auth.ts
- 시간: 1.8s

### ✅ dba (users 테이블)
- 생성: prisma/migrations/xxx
- 시간: 1.2s

### 총 소요 시간: 2.5s (순차 실행시 5.3s)
```

---

## 에러 처리

### 부분 실패
```
parallel 중 일부 에이전트만 실패:
  → 성공한 에이전트 결과는 유지
  → 실패한 에이전트만 재시도 (최대 2회)
  → 재시도 실패 시 → 사용자에게 보고
```

### 에러 복구
실패 유형별 상세 절차: `.claude/references/error-recovery.md`
