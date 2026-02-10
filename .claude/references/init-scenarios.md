# 초기화 시나리오 테스트 가이드

dev-ai 첫 실행 시 git 초기화 동작을 검증하기 위한 시나리오입니다.

---

## 판단 흐름도

```
.claude/memory/.initialized 존재?
  ├─ Yes → Phase 1로 스킵 (초기화 완료된 프로젝트)
  └─ No → 첫 실행
           │
           .git 폴더 존재?
           ├─ No → 사용자에게 git init 여부 확인
           └─ Yes → origin URL 확인
                    │
                    origin에 "dev-ai" 포함?
                    ├─ No → "기존 프로젝트" 질문
                    └─ Yes → git status clean?
                             ├─ Yes → 자동 초기화 ✅
                             └─ No → 변경사항 처리 질문
```

---

## 시나리오 A: git clone 직후 실행 (가장 일반적)

### 상황
```bash
git clone https://github.com/user/dev-ai.git my-project
cd my-project
claude
```

### 수집 결과
| 변수 | 값 |
|------|-----|
| `HAS_GIT` | true |
| `ORIGIN_URL` | `https://github.com/user/dev-ai.git` |
| `IS_CLEAN` | true |

### 분기
→ `HAS_GIT=true` AND `ORIGIN_URL`에 "dev-ai" 포함 AND `IS_CLEAN=true`
→ **자동 초기화** (사용자 확인 불필요)

### 예상 동작
```
1. .git 폴더 삭제
2. git init
3. git add .
4. git commit -m "chore: init project from dev-ai template"
5. 프로젝트 초기 설정 진행
6. .claude/memory/.initialized 생성
```

### 검증
```bash
git log --oneline  # 커밋 1개만 존재
git remote -v      # origin 없음
ls .claude/memory/.initialized  # 파일 존재 (Windows: dir .omc\.initialized)
```

---

## 시나리오 B: 기존 프로젝트에 파일 복사

### 상황
```bash
cd existing-project  # 이미 git 있음
cp -r ../dev-ai/* .
claude
```

### 수집 결과
| 변수 | 값 |
|------|-----|
| `HAS_GIT` | true |
| `ORIGIN_URL` | `https://github.com/user/existing-project.git` |
| `IS_CLEAN` | true 또는 false |

### 분기
→ `HAS_GIT=true` AND `ORIGIN_URL`에 "dev-ai" **미포함**
→ **AskUserQuestion**: "기존 프로젝트에 dev-ai를 추가한 것 같습니다. git은 그대로 유지할까요?"

### 예상 동작
```
사용자 선택:
  - "유지" → git 초기화 스킵, 프로젝트 설정만 진행
  - "초기화" → .git 삭제 후 새로 init
→ .claude/memory/.initialized 생성
```

---

## 시나리오 C: clone 후 커밋 추가한 뒤 실행

### 상황
```bash
git clone https://github.com/user/dev-ai.git my-project
cd my-project
echo "test" > test.txt
git add . && git commit -m "test commit"
claude
```

### 수집 결과
| 변수 | 값 |
|------|-----|
| `HAS_GIT` | true |
| `ORIGIN_URL` | `https://github.com/user/dev-ai.git` |
| `IS_CLEAN` | true (커밋 완료 상태) |

### 분기
→ `HAS_GIT=true` AND `ORIGIN_URL`에 "dev-ai" 포함 AND `IS_CLEAN=true`
→ **자동 초기화** (현재 로직상 자동 실행됨)

### 주의
현재 로직은 "사용자 커밋 존재 여부"를 체크하지 않음.
사용자가 추가한 커밋이 있어도 `IS_CLEAN=true`면 자동 초기화됨.

**이것이 의도된 동작인지 확인 필요:**
- 의도됨: clone 직후가 아니어도 dev-ai origin이면 초기화
- 의도 아님: 커밋 수 비교 로직 추가 필요 (복잡도 증가)

---

## 시나리오 D: clone 후 파일 수정만 한 상태 (커밋 전)

### 상황
```bash
git clone https://github.com/user/dev-ai.git my-project
cd my-project
echo "modified" >> README.md
claude  # git add/commit 하지 않은 상태
```

### 수집 결과
| 변수 | 값 |
|------|-----|
| `HAS_GIT` | true |
| `ORIGIN_URL` | `https://github.com/user/dev-ai.git` |
| `IS_CLEAN` | false (수정된 파일 있음) |

### 분기
→ `HAS_GIT=true` AND `ORIGIN_URL`에 "dev-ai" 포함 AND `IS_CLEAN=false`
→ **AskUserQuestion**: "저장되지 않은 변경사항이 있습니다. 처리 방법을 선택해주세요:"

### 예상 동작
```
사용자 선택:
  - "커밋 후 초기화" → git add . && git commit 후 초기화 진행
  - "변경사항 버리고 초기화" → git checkout . 후 초기화 진행
  - "취소" → 초기화 중단, 사용자 명령 대기
```

---

## 시나리오 E: 이미 초기화된 프로젝트 재실행

### 상황
```bash
cd my-project  # 이전에 이미 초기화 완료
claude
```

### 예상 조건
- `.claude/memory/.initialized` 있음 ❌
- → Phase 0 스킵

### 예상 동작
```
→ 초기화 절차 완전 스킵
→ Phase 1: Persistent Context 로드로 바로 진입
→ 사용자 명령 대기
```

---

## 시나리오 F: dev-ai를 fork해서 clone

### 상황
```bash
git clone https://github.com/my-account/dev-ai-fork.git my-project
cd my-project
claude
```

### 수집 결과
| 변수 | 값 |
|------|-----|
| `HAS_GIT` | true |
| `ORIGIN_URL` | `https://github.com/my-account/dev-ai-fork.git` |
| `IS_CLEAN` | true |

### 분기
→ `ORIGIN_URL`에 "dev-ai" 포함 여부에 따라 다름:
  - `dev-ai-fork`는 "dev-ai" 문자열 포함 → 자동 초기화될 수 있음 ⚠️
  - 더 정확한 매칭 원하면: `/dev-ai.git$` 또는 `/dev-ai$` 패턴 사용

### 현재 동작
"dev-ai" 문자열만 체크하므로 fork도 자동 초기화 대상이 됨.
이것이 문제라면 origin URL 매칭을 더 엄격하게 변경 필요.

---

## 검증 체크리스트

각 시나리오 실행 후 확인:

```bash
# 1. 초기화 마커 존재
ls -la .claude/memory/.initialized

# 2. git 상태
git log --oneline -5
git remote -v
git status

# 3. Persistent Context 생성
cat .claude/memory/context/tech-stack.md
cat .claude/memory/context/project-state.md

# 4. 두 번째 실행 시 초기화 스킵 확인
claude  # 초기화 질문 없이 바로 명령 대기
```

---

## 엣지 케이스

### .git 없이 파일만 복사한 경우
```bash
cp -r dev-ai/* my-project/  # .git 폴더 제외하고 복사
cd my-project
claude
```

**수집 결과**: `HAS_GIT=false`

**분기**:
→ `HAS_GIT=false`
→ **AskUserQuestion**: "git 저장소가 아닙니다. 새로 초기화할까요?"

**예상 동작**:
```
사용자 선택:
  - "예" → git init → git add . → git commit
  - "아니오" → git 없이 진행 (비권장)
```

### 빈 폴더에서 시작
```bash
mkdir new-project && cd new-project
# dev-ai 파일 없음
claude
```
→ CLAUDE.md 없으므로 dev-ai 시스템 자체가 작동 안 함
→ 일반 Claude Code로 동작

### remote가 없는 경우 (git init만 한 상태)
```bash
git init my-project
cp -r dev-ai/* my-project/
cd my-project
claude
```

**수집 결과**:
| 변수 | 값 |
|------|-----|
| `HAS_GIT` | true |
| `ORIGIN_URL` | (빈 값 또는 에러) |
| `IS_CLEAN` | false (복사된 파일들이 untracked) |

**분기**:
→ `ORIGIN_URL` 없음 → "dev-ai" 미포함으로 처리
→ **AskUserQuestion**: "기존 프로젝트에 dev-ai를 추가한 것 같습니다..."
