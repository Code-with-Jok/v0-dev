# V0-dev: Background Jobs với Inngest + AI SDK - Part 5

## 1. Inngest là gì?

**Inngest** là nền tảng để chạy **background jobs** và **event-driven workflows** trong Next.js. Giúp bạn xử lý các tác vụ tốn thời gian (AI generation, data processing) mà không bị timeout.

### Tại sao cần Inngest?

- ⏱️ **Tránh Timeout**: Next.js API routes có giới hạn 10-60s, AI generation có thể mất vài phút
- 🔄 **Auto Retry**: Tự động retry khi có lỗi với exponential backoff
- 📊 **Dashboard**: Monitor jobs, xem logs, debug dễ dàng
- 🎯 **Event-Driven**: Trigger jobs bằng events, không cần polling

## 2. Cài đặt

```bash
npm install inngest ai @ai-sdk/google
```

**Package.json:**

```json
{
  "dependencies": {
    "inngest": "^3.50.0",
    "ai": "^6.0.67",
    "@ai-sdk/google": "^3.0.20"
  }
}
```

## 3. Setup Inngest Client

**File: `src/inngest/client.ts`**

```typescript
import { Inngest } from "inngest";

// Create a client to send and receive events
export const inngest = new Inngest({ id: "v0-dev" });
```

## 4. Tạo Background Function

**File: `src/app/api/inngest/functions.ts`**

```typescript
import { inngest } from "@/inngest/client";
import { google } from "@ai-sdk/google";
import { generateText } from "ai";

export const demoGenerated = inngest.createFunction(
  { id: "demo-generated" },
  { event: "demo/generated" },
  async ({ step }) => {
    await step.run("generate-text", async () => {
      return await generateText({
        model: google("gemini-2.5-flash"),
        prompt: "Write a vegetarian lasagna recipe for 4 people",
      });
    });
  }
);
```

**Giải thích:**

- `id`: Unique ID cho function
- `event`: Event name để trigger function
- `step.run()`: Mỗi step có thể retry độc lập

## 5. Setup API Route Handler

**File: `src/app/api/inngest/route.ts`**

```typescript
import { inngest } from "@/inngest/client";
import { serve } from "inngest/next";
import { demoGenerated } from "./functions";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [demoGenerated],
});
```

## 6. Trigger Background Job

**File: `src/app/api/demo/background/route.ts`**

```typescript
import { inngest } from "@/inngest/client";

export async function POST() {
  await inngest.send({
    name: "demo/generated",
    data: {},
  });
  return Response.json({
    status: "started",
  });
}
```

**File: `src/app/demo/page.tsx`**

```tsx
"use client";

import { Button } from "@/components/ui/button";
import { useState } from "react";

export default function DemoPage() {
  const [loading, setLoading] = useState(false);

  const handleBackground = async () => {
    setLoading(true);
    await fetch("/api/demo/background", { method: "POST" });
    setLoading(false);
  };

  return (
    <div className="p-8 space-x-4">
      <Button disabled={loading} onClick={handleBackground}>
        {loading ? "Running..." : "Run background"}
      </Button>
    </div>
  );
}
```

## 7. Chạy Dev Server

Cần chạy **3 terminals** đồng thời:

```bash
# Terminal 1
npm run dev

# Terminal 2
npx convex dev

# Terminal 3
npx inngest-cli@latest dev
```

**Inngest Dashboard:** `http://localhost:8288`

## 8. Testing

1. Truy cập `http://localhost:3000/demo`
2. Click "Run background"
3. Mở `http://localhost:8288` để xem job chạy
4. Click vào job để xem logs và kết quả

## 9. Multi-Step Workflow (Advanced)

```typescript
export const complexWorkflow = inngest.createFunction(
  { id: "complex-workflow" },
  { event: "workflow/start" },
  async ({ event, step }) => {
    // Step 1: Generate content
    const content = await step.run("generate-content", async () => {
      return await generateText({
        model: google("gemini-2.5-flash"),
        prompt: event.data.prompt,
      });
    });

    // Step 2: Save to database
    const projectId = await step.run("save-to-db", async () => {
      // Call API or Convex mutation
      return "project-id-123";
    });

    // Step 3: Send notification
    await step.run("send-notification", async () => {
      console.log(`Project ${projectId} created`);
    });

    return { projectId, content };
  }
);
```

## 10. Production Deployment

**Environment Variables:**

```env
INNGEST_EVENT_KEY=your-event-key
INNGEST_SIGNING_KEY=your-signing-key
```

Lấy keys từ: https://app.inngest.com/

## 11. Troubleshooting

### Lỗi "Functions not discovered"

- Đảm bảo `npm run dev` đang chạy
- Kiểm tra `http://localhost:3000/api/inngest` accessible
- Restart Inngest Dev Server

### Event không trigger function

- Kiểm tra event name khớp chính xác (case-sensitive)
- Event trong `createFunction()` phải giống `inngest.send()`

## 12. Tóm tắt

✅ **Setup**: `npm install inngest` → Tạo client → Tạo functions
✅ **Trigger**: Gửi event qua `inngest.send()`
✅ **Monitor**: Dashboard tại `localhost:8288`
✅ **AI Integration**: Kết hợp với Vercel AI SDK
✅ **Retry**: Tự động retry với exponential backoff
