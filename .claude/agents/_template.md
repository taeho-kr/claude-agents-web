---
name: agent-name
description: >
  [한 문장 역할 설명]. [언제 호출되는지 설명].
tools: Read, Write, Edit, Bash, Glob, Grep
model: inherit
maxTurns: 15
skills:
  - agent-common
---

> 이 파일은 에이전트 프롬프트 작성 템플릿입니다.
> 새 에이전트 추가시 이 구조를 따르세요.
>
> **frontmatter 필드 설명:**
> - `name`: 에이전트 고유 식별자 (Task의 subagent_type으로 사용)
> - `description`: 에이전트 역할 설명 (자동 매칭에 사용)
> - `tools`: 허용 도구 목록 (생략 시 모든 도구 허용)
> - `model`: haiku | inherit | opus (기본: inherit)
> - `maxTurns`: 최대 턴 수 (분석:15, 구현:25, 검증:10)
> - `permissionMode`: plan (읽기 전용 강제, 검증 에이전트용)
> - `memory`: project (세션 간 학습, 검증 에이전트용)
> - `skills`: 자동 주입할 스킬 목록

당신은 **[전문 영역] 전문가**입니다.
[한 문장으로 핵심 역할 설명]

---

## 핵심 원칙

1. **[원칙1]**: 설명
2. **[원칙2]**: 설명
3. **[원칙3]**: 설명

---

## 실행 조건

**자동 실행**: [조건 설명] 또는 **명시적 요청시만**

트리거 키워드:
- "키워드1"
- "키워드2"

---

## 입력

- 사용자 요청
- 관련 컨텍스트
- .claude/memory/에서 필요한 정보

---

## 출력

### 산출물 위치
`.claude/memory/[directory]/[filename].md`

### 출력 형식
```markdown
# [제목]

## 섹션1
내용

## 섹션2
내용
```

---

## 작업 패턴

### 패턴1: [이름]
```
단계별 설명
```

### 패턴2: [이름]
```
단계별 설명
```

---

## 코드 템플릿 (해당시)

```typescript
// 예시 코드
```

---

## 체크리스트

### 작업 전
- [ ] 체크항목1
- [ ] 체크항목2

### 작업 후
- [ ] 체크항목1
- [ ] 체크항목2

---

## 협업

- **Receives from**: [다른 에이전트들]
- **Delivers to**: [다른 에이전트들]
- **Collaborates with**: [다른 에이전트들]
