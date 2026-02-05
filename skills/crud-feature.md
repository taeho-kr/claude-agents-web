# Skill: CRUD 기능 구현

## 설명
리소스에 대한 Create, Read, Update, Delete 기능을 구현하는 패턴입니다.

---

## 사용 시점
- "게시글 CRUD 만들어줘"
- "상품 관리 기능 구현해줘"
- "사용자 목록 페이지 만들어줘"
- "댓글 기능 추가해줘"

---

## 에이전트 워크플로우

```
1. [analyst] 리소스 분석
   - 필드 정의
   - 관계 정의
   - 권한 정의

2. [planner] 작업 계획
   - API 엔드포인트
   - 페이지/컴포넌트
   - 테스트 케이스

3. [dba] DB 스키마
   - 테이블 생성
   - 인덱스 설정
   - 관계 설정

4. [backend] API 구현
   - CRUD 엔드포인트
   - 페이지네이션
   - 필터링/검색

5. [frontend] UI 구현
   - 목록 페이지
   - 상세 페이지
   - 폼 (생성/수정)

6. [unit-tester] 유닛 테스트 ⚡
   - CRUD 동작
   - 엣지 케이스
   - 권한 체크
```

---

## 표준 API 패턴

### RESTful 엔드포인트
| Method | Path | 설명 |
|--------|------|------|
| GET | /api/posts | 목록 조회 |
| GET | /api/posts/:id | 단일 조회 |
| POST | /api/posts | 생성 |
| PUT | /api/posts/:id | 전체 수정 |
| PATCH | /api/posts/:id | 부분 수정 |
| DELETE | /api/posts/:id | 삭제 |

### 목록 조회 쿼리
```
GET /api/posts?page=1&limit=20&sort=createdAt:desc&search=keyword
```

### 응답 형식
```json
{
  "data": [...],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

---

## 표준 구현

### DB 스키마 (예: Post)
```prisma
model Post {
  id        String   @id @default(cuid())
  title     String
  content   String
  published Boolean  @default(false)
  authorId  String
  author    User     @relation(fields: [authorId], references: [id])
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([authorId])
  @@index([createdAt])
}
```

### Backend (Express)
```typescript
// routes/posts.ts
router.get('/', paginate(), async (req, res) => {
  const posts = await postService.findAll(req.pagination);
  res.json(posts);
});

router.get('/:id', async (req, res) => {
  const post = await postService.findById(req.params.id);
  if (!post) return res.status(404).json({ error: 'Not found' });
  res.json(post);
});

router.post('/', auth, validate(createPostSchema), async (req, res) => {
  const post = await postService.create(req.user.id, req.body);
  res.status(201).json(post);
});

router.put('/:id', auth, validate(updatePostSchema), async (req, res) => {
  const post = await postService.update(req.params.id, req.body);
  res.json(post);
});

router.delete('/:id', auth, async (req, res) => {
  await postService.delete(req.params.id);
  res.status(204).send();
});
```

### Frontend 컴포넌트
```
src/
├── pages/
│   └── posts/
│       ├── index.tsx      # 목록
│       ├── [id].tsx       # 상세
│       ├── new.tsx        # 생성
│       └── [id]/edit.tsx  # 수정
└── components/
    └── posts/
        ├── PostList.tsx
        ├── PostCard.tsx
        ├── PostForm.tsx
        └── PostDetail.tsx
```

---

## 체크리스트

### 기본 기능
- [ ] 목록 조회 (페이지네이션)
- [ ] 단일 조회
- [ ] 생성
- [ ] 수정
- [ ] 삭제

### 추가 기능
- [ ] 검색
- [ ] 필터링
- [ ] 정렬
- [ ] 소프트 삭제 (선택)

### 보안
- [ ] 인증 체크
- [ ] 권한 체크 (소유자만 수정/삭제)
- [ ] 입력 검증
