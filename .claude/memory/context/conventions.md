# Coding Conventions

> 세션 간 유지되는 프로젝트 코딩 컨벤션.
> 모든 실행 에이전트(frontend, backend, dba, ai-server, executor)는 이 파일을 따릅니다.

---

## 파일 구조

<!-- 예시:
- Feature-based 구조: src/features/{feature}/
- 컴포넌트: src/components/{domain}/{Component}.tsx
- API: src/app/api/{resource}/route.ts
- Hook: src/hooks/use{Name}.ts
-->

## API 설계

<!-- 예시:
- RESTful, 복수형 리소스 (/api/posts, /api/users)
- 응답 포맷: { data, meta, error }
- 에러 포맷: { code, message, details }
- 페이지네이션: cursor 기반 (offset 허용)
- 인증: Bearer token in Authorization header
-->

## 컴포넌트 패턴

<!-- 예시:
- Props interface: {Component}Props
- 분리 기준: container vs presentational
- 훅 추출: 로직 3줄 이상이면 커스텀 훅
- 테스트: 각 컴포넌트 옆에 .test.tsx
-->

## 에러 처리

<!-- 예시:
- try/catch: API 호출, 외부 의존성
- Error Boundary: 페이지 단위
- 사용자 알림: toast (성공 green, 에러 red)
- 로깅: console.error + Sentry
-->

## 테스트

<!-- 예시:
- 단위 테스트: Vitest / Jest
- 컴포넌트: React Testing Library
- E2E: Playwright
- 커버리지 목표: 80%+
-->

## Git

<!-- 예시:
- Branch: feature/{name}, fix/{name}, chore/{name}
- Commit: Conventional Commits (feat:, fix:, chore:)
- PR: squash merge
-->
