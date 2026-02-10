# Persistent Memory 작성 예시

> 빈 템플릿(.claude/memory/context/)을 채울 때 참고하는 예시입니다.
> 아래 예시는 "Next.js 블로그 플랫폼" 가상 프로젝트 기준입니다.

---

## preferences.md 예시

```markdown
# User Preferences

## 코딩 스타일
- 화살표 함수 선호 (function 키워드는 export default만)
- 세미콜론 필수
- 2스페이스 인덴트
- 문자열은 작은따옴표

## 네이밍
- 컴포넌트: PascalCase (PostCard.tsx)
- 변수/함수: camelCase
- 상수: UPPER_SNAKE_CASE
- 파일: kebab-case (post-card.tsx는 안 됨, PostCard.tsx 사용)
- 타입/인터페이스: PascalCase, Props는 {Component}Props

## UI/UX 선호
- 미니멀 디자인
- 다크모드 기본
- 토스트 알림 선호 (모달 최소화)
- 로딩 시 스켈레톤 UI 사용

## 라이브러리 선호
- 폼: react-hook-form + zod
- 상태관리: zustand (전역), useState (로컬)
- HTTP: fetch (axios 사용 안 함)
- 날짜: dayjs
- 아이콘: lucide-react

## 기타
- console.log 대신 structured logging
- 한국어 주석 허용
- any 타입 사용 금지
```

---

## tech-stack.md 예시

```markdown
# Tech Stack Decisions

## Frontend
- Framework: Next.js 14 (App Router)
- Language: TypeScript 5.3 (strict mode)
- Styling: Tailwind CSS v3.4
- State: Zustand 4.x
- Form: React Hook Form 7.x + Zod 3.x
- UI Kit: shadcn/ui (Radix 기반)
- 에디터: Tiptap (리치 텍스트)

## Backend
- Runtime: Next.js API Routes (App Router)
- ORM: Prisma 5.x
- Auth: NextAuth.js v5 (JWT 모드)
- Validation: Zod
- 파일 업로드: uploadthing

## Database
- Primary: PostgreSQL 16 (Supabase)
- Cache: 없음 (ISR로 대체)

## AI/ML
- 없음

## Infrastructure
- Hosting: Vercel (프론트+백 통합)
- CI/CD: GitHub Actions
- 이미지: Vercel Image Optimization
- 모니터링: Sentry
- 분석: Vercel Analytics

## Package Manager
- pnpm 8.x
```

---

## conventions.md 예시

```markdown
# Coding Conventions

## 파일 구조
- Feature-based: src/features/{feature}/
- 컴포넌트: src/components/{domain}/{Component}.tsx
- API: src/app/api/{resource}/route.ts
- Hook: src/hooks/use{Name}.ts
- 유틸: src/lib/{name}.ts
- 타입: src/types/{domain}.ts

## API 설계
- RESTful, 복수형 리소스 (/api/posts, /api/users)
- 응답: { data, meta?, error? }
- 에러: { code: string, message: string, details?: unknown }
- 페이지네이션: cursor 기반 기본, offset 허용
- 인증: Bearer token in Authorization header

## 컴포넌트 패턴
- Props: {Component}Props 인터페이스
- 서버 컴포넌트 기본, 클라이언트 필요 시 'use client'
- 훅 추출: 로직 5줄 이상이면 커스텀 훅
- 이벤트 핸들러: handle{Event} (handleClick, handleSubmit)

## 에러 처리
- API: try/catch + NextResponse.json({ error }, { status })
- 클라이언트: Error Boundary (페이지 단위)
- 알림: sonner 토스트 (성공 green, 에러 red)
- 로깅: Sentry.captureException

## 테스트
- 단위: Vitest
- 컴포넌트: React Testing Library
- E2E: Playwright
- 커버리지: 80%+

## Git
- Branch: feature/{name}, fix/{name}, chore/{name}
- Commit: Conventional Commits (feat:, fix:, chore:, docs:)
- PR: squash merge
```

---

## project-state.md 예시

```markdown
# Project State

## 현재 상태
- **Phase**: 핵심 기능 개발
- **마지막 작업**: 게시글 CRUD 구현 완료
- **마지막 세션**: 2024-01-18

## 완료된 기능
- [x] 프로젝트 초기 설정 (Next.js + Prisma + Tailwind) (2024-01-15)
- [x] 사용자 인증 (NextAuth JWT + 소셜 로그인) (2024-01-16)
- [x] 게시글 CRUD (작성/수정/삭제/목록/상세) (2024-01-18)

## 진행 중인 기능
- [ ] 댓글 기능 - backend API 완료, frontend 진행 중
- [ ] 마크다운 에디터 - Tiptap 통합 중, 이미지 업로드 미구현

## 알려진 이슈
- #12: 모바일에서 사이드바 겹침 현상 (frontend)
- #15: 게시글 목록 50개 이상시 페이지네이션 느림 (backend/dba)
- #18: 소셜 로그인 콜백 URL이 프로덕션에서 잘못됨 (backend)

## 다음 작업 후보
- 태그/카테고리 시스템
- 검색 기능 (full-text search)
- 이미지 업로드 (uploadthing)
- 알림 시스템
```

---

## 작성 원칙

1. **구체적 값 사용**: "좋은 라이브러리" → "zustand 4.x"
2. **버전 명시**: 메이저 버전은 반드시, 마이너는 가능하면
3. **결정 이유 생략**: 왜 선택했는지가 아니라 무엇을 선택했는지만
4. **중복 금지**: tech-stack에 적은 내용을 conventions에 반복하지 않음
5. **갱신 시점**:
   - preferences: 사용자가 선호 표현할 때마다
   - tech-stack: 새 기술 도입/변경 시
   - conventions: 컨벤션 합의/변경 시
   - project-state: 매 작업 완료 시
