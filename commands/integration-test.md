# Command: integration-test

## 설명
통합 테스트 및 E2E 테스트를 명시적으로 실행합니다.
실제 서비스 연동을 검증하며, 테스트 환경 설정부터 정리까지 수행합니다.

**참고**: 유닛 테스트는 구현 후 자동 실행됩니다. 이 명령은 E2E/통합 테스트 전용입니다.

---

## 사용법
```
integration-test [대상]
integration-test [옵션] [대상]
```

예시:
```
integration-test                      # 전체 통합 테스트
integration-test auth                 # 인증 흐름만
integration-test --e2e checkout       # 결제 E2E 테스트
integration-test --api /api/users     # API 통합 테스트
```

---

## 워크플로우

### 1단계: 환경 준비
```
[integration-tester] 테스트 환경 확인
                     - 테스트 DB 연결
                     - 외부 서비스 sandbox 설정
                     - 시드 데이터 로드
```

### 2단계: 테스트 실행
```
[integration-tester] 테스트 실행
                     - API 통합 테스트
                     - E2E 테스트 (Playwright/Cypress)
                     - 서비스 간 연동 테스트
```

### 3단계: 정리
```
[integration-tester] 테스트 후 정리
                     - 테스트 데이터 삭제
                     - 연결 종료
                     - 결과 리포트
                     → .omc/notepads/integration-tests.md
```

---

## 옵션

### --e2e
브라우저 기반 E2E 테스트만 실행
```
integration-test --e2e
integration-test --e2e login-flow
```

### --api
API 통합 테스트만 실행
```
integration-test --api
integration-test --api /api/auth/*
```

### --smoke
핵심 경로만 빠르게 검증
```
integration-test --smoke
```

### --headed
브라우저 UI 표시 (디버깅용)
```
integration-test --e2e --headed
```

### --report
상세 리포트 생성
```
integration-test --report
```

---

## 테스트 유형

### API 통합 테스트
실제 DB와 연동하여 API 검증
```
- 인증 흐름 (register → login → me)
- CRUD 시나리오
- 에러 케이스
- 권한 검증
```

### E2E 테스트
브라우저에서 사용자 흐름 검증
```
- 로그인/로그아웃
- 주요 기능 흐름
- 폼 제출
- 페이지 네비게이션
```

### 서비스 간 통합
외부 API/마이크로서비스 연동 검증
```
- 결제 (Stripe sandbox)
- 이메일 (mock)
- 파일 업로드 (S3 sandbox)
```

---

## 환경 설정

### 필수 파일
```
.env.test              # 테스트 환경변수
docker-compose.test.yml # 테스트 DB (선택)
playwright.config.ts   # E2E 설정 (선택)
```

### 환경변수 예시
```env
# .env.test
DATABASE_URL="postgresql://localhost:5432/myapp_test"
STRIPE_KEY="sk_test_xxx"
NODE_ENV="test"
```

---

## 출력

### 콘솔 출력
```
Integration Tests
  Auth Flow
    ✓ should register new user (1.2s)
    ✓ should login with credentials (0.8s)
    ✓ should reject invalid password (0.3s)

Tests: 3 passed, 3 total
Time: 2.5s
```

### 리포트 파일
`.omc/notepads/integration-tests.md`:
```markdown
## [타임스탬프] Integration Test

### 범위
- 인증 흐름

### 결과
- 통과: 3
- 실패: 0

### 환경
- DB: PostgreSQL (test)
- 외부 API: Stripe (sandbox)

### 정리
- 테스트 데이터 삭제 완료
```

---

## 트리거 키워드

다음 키워드 사용시 이 명령이 실행됩니다:
- "통합 테스트 해줘"
- "E2E 테스트 실행"
- "integration test"
- "end-to-end test"
- "전체 흐름 테스트"
