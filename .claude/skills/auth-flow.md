# Skill: 인증 플로우 구현

## 설명
사용자 인증 시스템을 구현하는 재사용 가능한 패턴입니다.
로그인, 로그아웃, 회원가입, 토큰 관리를 포함합니다.

---

## 트리거 조건

### 키워드 (하나 이상 포함 시 트리거)
`로그인`, `로그아웃`, `회원가입`, `인증`, `auth`, `JWT`, `세션`, `토큰`, `소셜 로그인`, `OAuth`, `2FA`

### 예시 요청
- "로그인 기능 구현해줘"
- "인증 시스템 만들어줘"
- "JWT 인증 추가해줘"
- "회원가입 구현해줘"

### 트리거하지 않는 경우
- 단순 API 키 인증 → api-integration 스킬
- 기존 인증의 버그 수정 → autopilot으로 직접 처리
- 권한(authorization) 로직만 추가 → autopilot으로 직접 처리

### 전제 조건
- tech-stack.md에 Backend 프레임워크가 정의되어 있어야 함
- DB가 설정되어 있어야 함 (User 테이블 필요)
- 없으면: 사용자에게 기술 스택 확인 후 tech-stack.md 먼저 채움

### 파라미터 추출
| 파라미터 | 추출 방법 | 기본값 |
|----------|-----------|--------|
| 인증 방식 | "JWT", "세션", "OAuth" 언급 확인 | JWT |
| 소셜 로그인 | "Google", "GitHub", "카카오" 등 언급 | 없음 |
| 2FA | "2차 인증", "2FA", "MFA" 언급 | 없음 |
| 이메일 인증 | "이메일 확인", "인증 메일" 언급 | 없음 |

---

## 에이전트 워크플로우

```
1. [researcher] 기존 인증 코드 분석
   - 사용 중인 인증 라이브러리
   - 기존 User 모델
   - 세션/토큰 방식

2. [analyst] 요구사항 분석
   - 인증 방식 (JWT/Session)
   - 토큰 만료 정책
   - 보안 요구사항

3. [planner] 작업 계획
   - 필요한 엔드포인트
   - DB 스키마 변경
   - 프론트엔드 컴포넌트

4. [parallel] 구현
   - [dba] 스키마 설계 (users, sessions)
   - [backend] API 구현 (/auth/*)
   - [frontend] 폼 컴포넌트

5. [unit-tester] 유닛 테스트 ⚡
   - 정상 로그인/로그아웃
   - 잘못된 자격 증명
   - 토큰 만료

6. [code-reviewer] 보안 검토
   - 비밀번호 해싱
   - 토큰 검증
   - CORS 설정
```

---

## 표준 구현

### DB 스키마 (Prisma)
```prisma
model User {
  id           String    @id @default(cuid())
  email        String    @unique
  passwordHash String
  name         String?
  role         Role      @default(USER)
  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @updatedAt
  sessions     Session[]
}

model Session {
  id        String   @id @default(cuid())
  token     String   @unique
  userId    String
  expiresAt DateTime
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

### API 엔드포인트
| Method | Path | 설명 |
|--------|------|------|
| POST | /auth/register | 회원가입 |
| POST | /auth/login | 로그인 |
| POST | /auth/logout | 로그아웃 |
| POST | /auth/refresh | 토큰 갱신 |
| GET | /auth/me | 현재 사용자 |

### 프론트엔드 컴포넌트
- LoginForm
- RegisterForm
- AuthProvider (Context)
- useAuth (Hook)
- ProtectedRoute

---

## 보안 체크리스트

- [ ] 비밀번호 bcrypt 해싱 (salt round 10+)
- [ ] JWT 시크릿 환경변수 관리
- [ ] 토큰 만료 시간 설정
- [ ] Rate limiting (로그인 시도 제한)
- [ ] HTTPS 강제
- [ ] HttpOnly 쿠키 (XSS 방지)
- [ ] CSRF 토큰 (필요시)

---

## 변형

### Session 기반
- 서버에서 세션 상태 관리
- Redis 세션 스토어 사용
- 로그아웃시 서버에서 무효화

### OAuth 추가
- Google/GitHub 소셜 로그인
- NextAuth.js 또는 Passport.js 사용
- 계정 연결 로직

### 2FA 추가
- TOTP 기반 (Google Authenticator)
- SMS/Email 인증
- 복구 코드 관리
