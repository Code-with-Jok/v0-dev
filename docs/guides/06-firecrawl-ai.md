# V0-dev: Web Scraping với Firecrawl + AI - Part 6

## 1. Firecrawl là gì?

**Firecrawl** là một API service để scrape (thu thập) nội dung từ websites và convert sang định dạng markdown, LLM-ready. Được tối ưu để làm việc với AI models.

### Tại sao cần Firecrawl?

- 🌐 **Clean Content**: Tự động loại bỏ ads, navigation, footer - chỉ giữ nội dung chính
- 📝 **Markdown Output**: Convert HTML sang markdown, dễ đọc cho AI
- 🚀 **Fast & Reliable**: Handle JavaScript rendering, dynamic content
- 🔄 **Batch Processing**: Scrape nhiều URLs cùng lúc
- 🤖 **AI-Ready**: Format tối ưu cho LLM context

## 2. Cài đặt

```bash
npm install @mendable/firecrawl-js
```

**Package.json:**

```json
{
  "dependencies": {
    "@mendable/firecrawl-js": "^4.12.0"
  }
}
```

## 3. Setup Firecrawl Client

### 3.1 Lấy API Key

1. Truy cập: https://firecrawl.dev/
2. Sign up và lấy API key
3. Thêm vào `.env.local`:

```env
FIRECRAWL_API_KEY=fc-your-api-key-here
```

### 3.2 Tạo Firecrawl Client

**File: `src/lib/firecrawl.ts`**

```typescript
import Firecrawl from "@mendable/firecrawl-js";

export const firecrawl = new Firecrawl({
  apiKey: process.env.FIRECRAWL_API_KEY!,
});
```

## 4. Integration với Inngest

### 4.1 URL Extraction + Scraping Workflow

**File: `src/inngest/functions.ts`**

```typescript
import { inngest } from "@/inngest/client";
import { firecrawl } from "@/lib/firecrawl";
import { google } from "@ai-sdk/google";
import { generateText } from "ai";

const URL_REGEX = /https?:\/\/[^\s]+/g;

export const demoGenerated = inngest.createFunction(
  { id: "demo-generated" },
  { event: "demo/generated" },
  async ({ event, step }) => {
    const { prompt } = event.data as { prompt: string };

    // Step 1: Extract URLs from prompt
    const urls = (await step.run("extract-urls", async () => {
      return prompt.match(URL_REGEX) ?? [];
    })) as string[];

    // Step 2: Scrape URLs with Firecrawl
    const scrapedContent = await step.run("scrape-urls", async () => {
      const results = await Promise.all(
        urls.map(async (url) => {
          const result = await firecrawl.scrape(url, {
            formats: ["markdown"],
          });
          return result.markdown ?? null;
        })
      );
      return results.filter(Boolean).join("\n\n");
    });

    // Step 3: Build context-aware prompt
    const finalPrompt = scrapedContent
      ? `Context:\n${scrapedContent}\n\nQuestion: ${prompt}`
      : prompt;

    // Step 4: Generate AI response
    await step.run("generate-text", async () => {
      return await generateText({
        model: google(process.env.MODEL_AI!),
        prompt: finalPrompt,
      });
    });
  }
);
```

### 4.2 Giải thích Workflow

**Step 1: Extract URLs**

- Sử dụng regex để tìm tất cả URLs trong prompt
- Trả về array của URLs

**Step 2: Scrape URLs**

- `Promise.all()`: Scrape tất cả URLs song song
- `firecrawl.scrape()`: Scrape từng URL
- `formats: ["markdown"]`: Lấy output dạng markdown
- Filter và join kết quả

**Step 3: Build Context**

- Nếu có scraped content → thêm vào prompt như context
- Nếu không có URLs → dùng prompt gốc

**Step 4: AI Generation**

- Generate response với context từ scraped content
- AI có thể trả lời dựa trên nội dung website

## 5. Use Cases

### 5.1 Summarize Article

**Prompt:**

```
Summarize this article: https://example.com/article
```

**Flow:**

1. Extract URL: `https://example.com/article`
2. Scrape content → markdown
3. AI summarize based on scraped content

### 5.2 Compare Multiple Sources

**Prompt:**

```
Compare these two articles:
https://site1.com/article1
https://site2.com/article2
```

**Flow:**

1. Extract 2 URLs
2. Scrape both → combine markdown
3. AI compare based on both contents

### 5.3 Answer with Context

**Prompt:**

```
Based on https://docs.example.com, how do I setup authentication?
```

**Flow:**

1. Extract URL
2. Scrape docs → markdown
3. AI answer question using docs as context

## 6. Advanced: Scrape Options

### 6.1 Custom Formats

```typescript
const result = await firecrawl.scrape(url, {
  formats: ["markdown", "html", "links"],
});

console.log(result.markdown); // Markdown content
console.log(result.html); // Raw HTML
console.log(result.links); // All links found
```

### 6.2 Wait for Selector

```typescript
const result = await firecrawl.scrape(url, {
  formats: ["markdown"],
  waitFor: 3000, // Wait 3s for JS to load
});
```

### 6.3 Extract Specific Elements

```typescript
const result = await firecrawl.scrape(url, {
  formats: ["markdown"],
  onlyMainContent: true, // Only main content, skip nav/footer
});
```

## 7. Error Handling

```typescript
const scrapedContent = await step.run("scrape-urls", async () => {
  const results = await Promise.all(
    urls.map(async (url) => {
      try {
        const result = await firecrawl.scrape(url, {
          formats: ["markdown"],
        });
        return result.markdown ?? null;
      } catch (error) {
        console.error(`Failed to scrape ${url}:`, error);
        return null;
      }
    })
  );
  return results.filter(Boolean).join("\n\n");
});
```

## 8. Testing

### 8.1 Test với Demo Page

1. Truy cập `http://localhost:3000/demo`
2. Nhập prompt có URL: `"Summarize https://example.com"`
3. Click "Run background"
4. Xem trong Inngest dashboard (`localhost:8288`)
5. Check step "scrape-urls" để xem scraped content

### 8.2 Test Multiple URLs

**Prompt:**

```
Compare these articles:
https://site1.com/article1
https://site2.com/article2
```

Check Inngest dashboard để xem cả 2 URLs được scrape.

## 9. Best Practices

### 9.1 Rate Limiting

- ✅ Firecrawl tự động handle rate limiting
- ✅ Sử dụng `Promise.all()` để scrape song song (faster)
- ⚠️ Có giới hạn requests/month tùy plan

### 9.2 Error Handling

- ✅ Luôn wrap `firecrawl.scrape()` trong try-catch
- ✅ Return `null` nếu scrape fail, filter sau
- ✅ Log errors để debug

### 9.3 Content Validation

```typescript
const scrapedContent = await step.run("scrape-urls", async () => {
  const results = await Promise.all(
    urls.map(async (url) => {
      const result = await firecrawl.scrape(url, {
        formats: ["markdown"],
      });

      // Validate content
      const markdown = result.markdown ?? "";
      if (markdown.length < 100) {
        console.warn(`Content too short for ${url}`);
        return null;
      }

      return markdown;
    })
  );
  return results.filter(Boolean).join("\n\n");
});
```

## 10. Pricing & Limits

- **Free Tier**: 500 credits/month
- **Pro**: $20/month - 10,000 credits
- **1 scrape** = 1 credit
- Check usage: https://firecrawl.dev/dashboard

## 11. Troubleshooting

### Lỗi "Invalid API Key"

- Kiểm tra `FIRECRAWL_API_KEY` trong `.env.local`
- Verify key tại https://firecrawl.dev/dashboard

### Scrape trả về empty

- Website có thể block scraping
- Thử tăng `waitFor` timeout
- Check website có require authentication không

### Timeout errors

- Tăng timeout trong Inngest function config
- Giảm số URLs scrape cùng lúc

## 12. Tóm tắt

✅ **Setup**: Install package → Lấy API key → Tạo client
✅ **Scrape**: `firecrawl.scrape(url, { formats: ["markdown"] })`
✅ **Integration**: Kết hợp với Inngest + AI SDK
✅ **Use Case**: Summarize, compare, answer với web context
✅ **Output**: Clean markdown, ready for AI
