# V0-dev: Error Monitoring với Sentry - Part 7

## 1. Sentry là gì?

**Sentry** là platform để monitor và track errors/exceptions trong ứng dụng real-time. Giúp bạn phát hiện, debug và fix lỗi nhanh chóng.

### Tại sao cần Sentry?

- 🐛 **Error Tracking**: Tự động catch và report mọi errors
- 📊 **Performance Monitoring**: Track performance issues
- 🔍 **Stack Traces**: Chi tiết stack trace để debug
- 👤 **User Context**: Biết user nào gặp lỗi
- 📈 **Analytics**: Thống kê errors, trends
- 🔔 **Alerts**: Nhận thông báo khi có lỗi mới

## 2. Cài đặt

### 2.1 Chạy Sentry Wizard

```bash
npx @sentry/wizard@latest -i nextjs --saas --org your-org --project your-project
```

**Wizard Options:**

1. **Route requests through Next.js server?** → `Yes`
   - Tránh bị ad blockers chặn
   - Requests đi qua `/api/sentry-tunnel`

2. **Enable Tracing?** → `Yes`
   - Track performance của ứng dụng
   - Monitor API response times

3. **Enable Session Replay?** → `Yes`
   - Video-like reproduction của user sessions
   - Xem lại chính xác user làm gì trước khi lỗi xảy ra

4. **Enable Logs?** → `Yes`
   - Gửi application logs lên Sentry
   - Tích hợp với error tracking

5. **Create example page?** → `Yes`
   - Tạo `/sentry-example-page` để test
   - Có sẵn button để trigger test error

### 2.2 Files được tạo

Wizard tự động tạo:

- ✅ `sentry.server.config.ts` - Server-side config
- ✅ `sentry.edge.config.ts` - Edge runtime config
- ✅ `src/instrumentation.ts` - Server instrumentation
- ✅ `src/instrumentation-client.ts` - Client instrumentation
- ✅ `src/app/global-error.tsx` - Global error boundary
- ✅ `src/app/sentry-example-page/page.tsx` - Test page
- ✅ `src/app/api/sentry-example-api/route.ts` - Test API
- ✅ `.env.sentry-build-plugin` - Build plugin config (gitignored)

**Package.json:**

```json
{
  "dependencies": {
<<<<<<< HEAD
    "@sentry/nextjs": "^9.x.x",
=======
    "@sentry/nextjs": "^10.38.0",
>>>>>>> bbe52a7 (feat: Add Firecrawl for web scraping and Sentry for error monitoring and performance tracing.)
    "@inngest/middleware-sentry": "^0.1.3"
  }
}
```

## 3. Cấu hình Sentry

### 3.1 Server Config

**File: `sentry.server.config.ts`**

```typescript
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "https://your-dsn@sentry.io/project-id",
  tracesSampleRate: 1,
  enableLogs: true,
  sendDefaultPii: true,

  integrations: [
    // Track Vercel AI SDK calls
    Sentry.vercelAIIntegration,

    // Send console.log, console.warn, console.error to Sentry
    Sentry.consoleLoggingIntegration({
      levels: ["log", "warn", "error"],
    }),
  ],
});
```

**Integrations:**

- **vercelAIIntegration**: Track AI SDK calls (generateText, streamText, etc.)
- **consoleLoggingIntegration**: Gửi console logs lên Sentry để debug

### 3.2 Edge Config

**File: `sentry.edge.config.ts`**

```typescript
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "https://your-dsn@sentry.io/project-id",
  tracesSampleRate: 1,
  enableLogs: true,
  sendDefaultPii: true,

  integrations: [
    Sentry.vercelAIIntegration,
    Sentry.consoleLoggingIntegration({
      levels: ["log", "warn", "error"],
    }),
  ],
});
```

### 3.3 Environment Variables

```env
SENTRY_DSN=https://your-dsn@sentry.io/project-id
SENTRY_ORG=your-org
SENTRY_PROJECT=your-project
SENTRY_AUTH_TOKEN=your-auth-token
```

## 4. Error Monitoring Setup

### 4.1 Client-Side Errors

**File: `src/app/demo/page.tsx`**

```typescript
"use client";

import * as Sentry from "@sentry/nextjs";
import { useAuth } from "@clerk/nextjs";

export default function DemoPage() {
  const { userId } = useAuth();

  const handleClientError = () => {
    Sentry.logger.info("User attempting to click on client function", {
      userId,
    });
    throw new Error("Client error: Something went wrong in the browser!");
  };

  return (
    <Button variant="destructive" onClick={handleClientError}>
      Client Error
    </Button>
  );
}
```

### 4.2 Server-Side Errors (API Routes)

**File: `src/app/api/demo/error/route.ts`**

```typescript
export async function POST() {
  throw new Error("API error: Something went wrong on the server!");
}
```

Sentry tự động catch errors trong API routes.

### 4.3 Background Job Errors (Inngest)

**File: `src/inngest/client.ts`**

```typescript
import { sentryMiddleware } from "@inngest/middleware-sentry";
import { Inngest } from "inngest";

export const inngest = new Inngest({
  id: "v0-dev",
  middleware: [sentryMiddleware()],
});
```

**File: `src/inngest/functions.ts`**

```typescript
export const demoError = inngest.createFunction(
  { id: "demo-error" },
  { event: "demo/error" },
  async ({ step }) => {
    await step.run("fail", async () => {
      throw new Error("Inngest error: Background job failed!");
    });
  }
);
```

**File: `src/app/api/inngest/route.ts`**

```typescript
import { inngest } from "@/inngest/client";
import { serve } from "inngest/next";
import { demoError, demoGenerated } from "../../../inngest/functions";

// Create an API that serves zero functions
export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [demoGenerated, demoError],
});
```

## 5. Testing Error Monitoring

### 5.1 Demo Page với Error Buttons

```typescript
export default function DemoPage() {
  const { userId } = useAuth();

  // 1) Client error
  const handleClientError = () => {
    Sentry.logger.info("User attempting to click on client function", {
      userId,
    });
    throw new Error("Client error: Something went wrong in the browser!");
  };

  // 2) API error
  const handleApiError = async () => {
    await fetch("/api/demo/error", { method: "POST" });
  };

  // 3) Inngest error
  const handleInngestError = async () => {
    await fetch("/api/demo/inngest-error", { method: "POST" });
  };

  return (
    <div className="p-8 space-x-4">
      <Button variant="destructive" onClick={handleClientError}>
        Client Error
      </Button>
      <Button variant="destructive" onClick={handleApiError}>
        API Error
      </Button>
      <Button variant="destructive" onClick={handleInngestError}>
        Inngest Error
      </Button>
    </div>
  );
}
```

### 5.2 Test Flow

1. Truy cập `http://localhost:3000/demo`
2. Click "Client Error" → Error xuất hiện trong Sentry
3. Click "API Error" → Server error được track
4. Click "Inngest Error" → Background job error được track
5. Xem errors tại Sentry dashboard

## 6. Sentry Dashboard

### 6.1 Truy cập Dashboard

- URL: `https://sentry.io/organizations/your-org/issues/`
- Xem tất cả errors được track
- Filter theo: Browser, Server, Background Jobs

### 6.2 Error Details

Mỗi error hiển thị:

- **Stack Trace**: Chi tiết dòng code bị lỗi
- **User Context**: userId, email (nếu có)
- **Environment**: Browser, OS, Device
- **Breadcrumbs**: Các actions trước khi lỗi xảy ra
- **Tags**: Custom tags để filter

## 7. Advanced: Custom Context

### 7.1 Set User Context

```typescript
import * as Sentry from "@sentry/nextjs";

Sentry.setUser({
  id: userId,
  email: user.email,
  username: user.username,
});
```

### 7.2 Add Custom Tags

```typescript
Sentry.setTag("page", "demo");
Sentry.setTag("feature", "error-testing");
```

### 7.3 Add Breadcrumbs

```typescript
Sentry.addBreadcrumb({
  category: "user-action",
  message: "User clicked button",
  level: "info",
});
```

## 8. Performance Monitoring

### 8.1 Track Performance

```typescript
const transaction = Sentry.startTransaction({
  name: "API Call",
  op: "http.request",
});

try {
  await fetch("/api/data");
} finally {
  transaction.finish();
}
```

### 8.2 Custom Spans

```typescript
await Sentry.startSpan(
  {
    name: "Database Query",
    op: "db.query",
  },
  async () => {
    // Your database query here
  }
);
```

## 9. Session Replay

### 9.1 Xem Session Replay

- Truy cập error trong Sentry dashboard
- Click tab "Replays" để xem video
- Replay hiển thị:
  - User interactions (clicks, scrolls, inputs)
  - Network requests
  - Console logs
  - DOM changes

### 9.2 Privacy Settings

```typescript
// sentry.server.config.ts
Sentry.init({
  dsn: "...",
  replaysSessionSampleRate: 0.1, // 10% sessions
  replaysOnErrorSampleRate: 1.0, // 100% khi có error

  // Mask sensitive data
  beforeSend(event) {
    // Remove passwords, credit cards, etc.
    return event;
  },
});
```

### 9.3 Use Cases

- 🎥 **Reproduce Bugs**: Xem chính xác user làm gì
- 🔍 **Debug UI Issues**: Thấy UI render như thế nào
- 📊 **User Behavior**: Hiểu user journey
- 🐛 **Error Context**: Biết context trước khi lỗi xảy ra

## 10. AI SDK Telemetry

### 10.1 Enable Telemetry

**File: `src/inngest/functions.ts`**

```typescript
await step.run("generate-text", async () => {
  return await generateText({
    model: google(process.env.MODEL_AI!),
    prompt: finalPrompt,
    experimental_telemetry: {
      isEnabled: true,
      recordInputs: true,
      recordOutputs: true,
    },
  });
});
```

**File: `src/app/api/demo/blocking/route.ts`**

```typescript
import { google } from "@ai-sdk/google";
import { generateText } from "ai";

export async function POST() {
  const response = await generateText({
    model: google(process.env.MODEL_AI!),
    prompt: "Hello, how are you?",
    experimental_telemetry: {
      isEnabled: true,
      recordInputs: true,
      recordOutputs: true,
    },
  });

  return new Response(response.text);
}
```

### 10.2 Telemetry Data

Sentry sẽ track:

- ✅ **AI Model**: Model name (gemini-2.5-flash, etc.)
- ✅ **Prompts**: Input prompts (nếu `recordInputs: true`)
- ✅ **Responses**: AI outputs (nếu `recordOutputs: true`)
- ✅ **Duration**: Thời gian AI generation
- ✅ **Tokens**: Token usage (input/output)
- ✅ **Errors**: AI SDK errors

### 10.3 Privacy Considerations

> [!WARNING]
> `recordInputs` và `recordOutputs` sẽ gửi prompts và responses lên Sentry. Cẩn thận với sensitive data!

```typescript
experimental_telemetry: {
  isEnabled: true,
  recordInputs: false,  // Don't send prompts
  recordOutputs: false, // Don't send responses
}
```

### 10.4 View AI Traces

1. Truy cập Sentry dashboard
2. Click "Performance" → "Traces"
3. Filter by "ai.generateText" operations
4. Xem duration, tokens, prompts/responses

## 11. Tunneling (Bypass Ad Blockers)

### 10.1 Cấu hình

Wizard đã tự động setup tunneling qua Next.js server:

```typescript
// next.config.ts
const sentryConfig = {
  tunnelRoute: "/monitoring",
};
```

### 10.2 Cách hoạt động

1. Browser gửi errors đến `/monitoring` (Next.js server)
2. Next.js forward requests đến Sentry
3. Ad blockers không block vì request đi qua domain của bạn

## 11. CI/CD Setup

### 11.1 Environment Variables

Thêm vào CI/CD (GitHub Actions, Vercel, etc.):

```env
SENTRY_AUTH_TOKEN=sntrys_your-token-here
SENTRY_ORG=your-org
SENTRY_PROJECT=your-project
```

> [!CAUTION]
> **KHÔNG commit `SENTRY_AUTH_TOKEN` vào Git!** Chỉ add vào CI/CD environment variables.

### 11.2 Source Maps Upload

Sentry tự động upload source maps khi build:

```bash
npm run build
```

Source maps giúp:

- Debug với code gốc (không bị minified)
- Thấy chính xác dòng code bị lỗi
- Stack traces dễ đọc hơn

## 12. Best Practices

### 12.1 Error Handling

- ✅ Let Sentry auto-catch errors (don't wrap everything in try-catch)
- ✅ Add user context để biết ai gặp lỗi
- ✅ Use breadcrumbs để track user journey
- ✅ Set custom tags để filter errors
- ✅ Enable Session Replay cho errors quan trọng

### 12.2 Performance

- ✅ Set `tracesSampleRate` < 1 trong production (ví dụ: 0.1 = 10%)
- ✅ Set `replaysSessionSampleRate` thấp (0.1 = 10%)
- ✅ Set `replaysOnErrorSampleRate` = 1.0 (100% khi có error)
- ✅ Use source maps để debug dễ hơn
- ✅ Enable tunneling để bypass ad blockers

### 12.3 Privacy

- ⚠️ `sendDefaultPii: true` sẽ gửi user data (email, IP)
- ⚠️ Session Replay có thể record sensitive data
- ✅ Use `beforeSend` để filter sensitive data
- ✅ Mask passwords, credit cards trong replays

## 13. Troubleshooting

### Errors không xuất hiện trong Sentry

- Kiểm tra `SENTRY_DSN` đúng chưa
- Verify network requests không bị block (check tunneling)
- Check Sentry dashboard có nhận được events không
- Xem console có errors từ Sentry SDK không

### Session Replay không hoạt động

- Kiểm tra `replaysSessionSampleRate` > 0
- Verify user consent (nếu có GDPR requirements)
- Check browser compatibility (modern browsers only)

### Too many events

- Giảm `tracesSampleRate` trong production
- Giảm `replaysSessionSampleRate`
- Add filters để ignore certain errors
- Use `ignoreErrors` config

## 14. Testing Setup

### 14.1 Sentry Example Page

Truy cập: `http://localhost:3000/sentry-example-page`

- Click "Throw Sample Error" để test
- Error sẽ xuất hiện trong Sentry dashboard
- Session Replay sẽ được record

### 14.2 Verify Setup

1. ✅ Client errors được track
2. ✅ Server errors được track
3. ✅ Performance traces được ghi
4. ✅ Session Replay hoạt động
5. ✅ Logs được gửi lên Sentry

## 15. Tóm tắt

✅ **Setup**: `npx @sentry/wizard@latest -i nextjs --saas`
✅ **Features**: Error tracking, Performance, Session Replay, Logs, AI Telemetry
✅ **Config**: Server, Edge, Client configs + Instrumentation
✅ **Integrations**: Vercel AI SDK, Console Logging
✅ **Track**: Client errors, API errors, Background job errors, AI calls
✅ **Monitor**: Dashboard với errors, replays, performance, AI traces
✅ **Debug**: Stack traces, user context, breadcrumbs, video replays
✅ **Inngest**: Sentry middleware để track background job errors
✅ **Tunneling**: Bypass ad blockers qua Next.js server
✅ **CI/CD**: Auto upload source maps
✅ **AI Telemetry**: Track prompts, responses, tokens, duration
