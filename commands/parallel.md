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

## 주의사항

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
