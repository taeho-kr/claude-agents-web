# External Integration Reference

외부 도구와 연동하여 수동 복붙 없이 직접 접근합니다.
Bash, WebFetch 등 사용 가능한 도구로 외부 서비스 정보를 자동 조회합니다.

---

## Git 플랫폼 연동

프로젝트가 사용하는 Git 플랫폼(GitHub, GitLab, Bitbucket 등)의 CLI/API를 활용합니다.
사용 가능한 CLI를 자동 감지하여 적절한 명령을 실행합니다.

```
사용 가능한 CLI 확인:
- gh (GitHub CLI)     → gh issue view, gh pr create ...
- glab (GitLab CLI)   → glab issue view, glab mr create ...
- Bash + curl         → REST API 직접 호출 (범용)
```

---

## 이슈 기반 워크플로우

사용자가 이슈 번호로 작업을 요청하면:
```
"#42 구현해줘" 또는 "이슈 42번 해결해줘"

1. Git 플랫폼 CLI로 이슈 내용 자동 조회
2. 이슈 내용을 요구사항으로 변환
3. 일반 워크플로우 진행 (autopilot/compose)
4. 완료 후 이슈에 코멘트 작성 (사용자 승인 시)
```

---

## API 스펙 연동

```
"이 Swagger로 API 클라이언트 만들어줘: https://api.example.com/docs"

1. WebFetch로 스펙 자동 조회
2. 엔드포인트 목록 추출
3. 타입 정의 + API 클라이언트 코드 생성
```

---

## CI/CD 연동

```
"CI 실패 원인 확인하고 고쳐줘"

1. 플랫폼 CLI/API로 최근 실패한 파이프라인 식별
2. 실패 로그 추출 및 에러 원인 분석
3. 수정 → 커밋
4. 재실행 (사용자 승인 후)
```

---

## 외부 문서/서비스 조회

```
"이 문서 참고해서 구현해줘: https://docs.example.com/api"

1. WebFetch로 문서 내용 자동 조회
2. 필요한 정보 추출 (API 스펙, 설정 가이드 등)
3. 추출된 정보를 에이전트 컨텍스트로 전달
```
