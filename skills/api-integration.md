# Skill: 외부 API 통합

## 설명
외부 서비스 API를 연동하는 패턴입니다.
결제, 소셜 로그인, 외부 데이터 등을 통합합니다.

---

## 사용 시점
- "Stripe 결제 연동해줘"
- "Google 로그인 추가해줘"
- "외부 API 연동해줘"
- "OpenAI API 통합해줘"

---

## 에이전트 워크플로우

```
1. [researcher] API 문서 조사
   - 엔드포인트 파악
   - 인증 방식
   - Rate limit
   - SDK 존재 여부

2. [analyst] 요구사항 정의
   - 필요한 기능
   - 에러 처리 전략
   - 재시도 정책

3. [backend] 클라이언트 구현
   - API 클라이언트 래퍼
   - 인증 처리
   - 에러 핸들링

4. [unit-tester] 유닛 테스트 ⚡
   - Mock 테스트
   - 실제 API 테스트 (sandbox)
   - 에러 케이스

5. [code-reviewer] 보안 검토
   - API 키 관리
   - 민감 정보 처리
```

---

## 표준 구현

### API 클라이언트 래퍼
```typescript
// lib/external-api.ts
import axios, { AxiosInstance } from 'axios';

class ExternalApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: process.env.EXTERNAL_API_URL,
      headers: {
        'Authorization': `Bearer ${process.env.EXTERNAL_API_KEY}`,
        'Content-Type': 'application/json',
      },
      timeout: 10000,
    });

    // 재시도 인터셉터
    this.client.interceptors.response.use(
      response => response,
      this.handleError.bind(this)
    );
  }

  private async handleError(error: any) {
    if (error.response?.status === 429) {
      // Rate limit - 재시도
      await this.sleep(1000);
      return this.client.request(error.config);
    }
    throw error;
  }

  async fetchData(id: string) {
    const response = await this.client.get(`/data/${id}`);
    return response.data;
  }

  async createResource(data: any) {
    const response = await this.client.post('/resources', data);
    return response.data;
  }
}

export const externalApi = new ExternalApiClient();
```

### 환경변수 관리
```env
# .env
EXTERNAL_API_URL=https://api.example.com
EXTERNAL_API_KEY=sk_live_xxx

# .env.example
EXTERNAL_API_URL=https://api.example.com
EXTERNAL_API_KEY=your_api_key_here
```

### Webhook 처리
```typescript
// routes/webhooks/external.ts
router.post('/external',
  express.raw({ type: 'application/json' }),
  async (req, res) => {
    const signature = req.headers['x-signature'];

    // 서명 검증
    if (!verifySignature(req.body, signature)) {
      return res.status(401).send('Invalid signature');
    }

    const event = JSON.parse(req.body);

    switch (event.type) {
      case 'payment.completed':
        await handlePaymentCompleted(event.data);
        break;
      // ...
    }

    res.json({ received: true });
  }
);
```

---

## 에러 처리 전략

### 재시도 로직
```typescript
async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  delay = 1000
): Promise<T> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      if (!isRetryable(error)) throw error;
      await sleep(delay * Math.pow(2, i)); // 지수 백오프
    }
  }
  throw new Error('Max retries reached');
}
```

### 에러 분류
```typescript
function isRetryable(error: any): boolean {
  // 재시도 가능한 에러
  if (error.code === 'ECONNRESET') return true;
  if (error.response?.status >= 500) return true;
  if (error.response?.status === 429) return true;

  // 재시도 불가 (클라이언트 에러)
  if (error.response?.status >= 400 && error.response?.status < 500) {
    return false;
  }

  return false;
}
```

---

## 체크리스트

### 구현 전
- [ ] API 문서 숙지
- [ ] 인증 방식 파악
- [ ] Rate limit 확인
- [ ] Sandbox/테스트 환경 확보

### 구현 중
- [ ] API 키 환경변수 관리
- [ ] 타임아웃 설정
- [ ] 재시도 로직
- [ ] 에러 로깅

### 구현 후
- [ ] Sandbox 테스트
- [ ] 에러 케이스 테스트
- [ ] Webhook 테스트 (해당시)
- [ ] Rate limit 테스트
