# 12. AI Suggestion Feature (Gợi ý code tự động)

> [!NOTE]
> Hướng dẫn này giải thích cách hoạt động của AI Suggestion — tính năng gợi ý code tự động (giống GitHub Copilot) trong editor.

## Tổng Quan

Khi bạn gõ code trong editor, hệ thống sẽ:

1. **Chờ 300ms** sau khi bạn ngừng gõ (debounce)
2. **Gửi context** (code xung quanh v0dev) lên API
3. **AI sinh suggestion** dựa trên context
4. **Hiển thị ghost text** (chữ mờ) tại vị trí v0dev
5. Nhấn **Tab** → chấp nhận suggestion, chèn vào code

## Kiến Trúc

```mermaid
flowchart TD
    subgraph Client["🖥️ Client (Browser)"]
        Editor["CodeEditor Component"]

        subgraph Extension["CodeMirror Extension"]
            State["state.ts<br/>Lưu suggestion text"]
            Debounce["debounce-plugin.ts<br/>Chờ 300ms rồi fetch"]
            Payload["payload.ts<br/>Tạo context payload"]
            Fetcher["fetcher.ts<br/>Gọi API"]
            Render["render-plugin.ts<br/>Hiển thị ghost text"]
            Widget["widget.ts<br/>Tạo DOM element"]
            Keymap["accept-keymap.ts<br/>Tab = chấp nhận"]
        end
    end

    subgraph Server["⚙️ Server (API Route)"]
        Schema["schema.ts<br/>Validation (Zod)"]
        Prompt["prompt.ts<br/>Build prompt"]
        Route["route.ts<br/>Xử lý request"]
        AI["Gemini AI<br/>Sinh suggestion"]
    end

    Editor --> Debounce
    Debounce -->|"sau 300ms"| Payload
    Payload --> Fetcher
    Fetcher -->|"POST /api/suggestion"| Route
    Route --> Schema
    Route --> Prompt
    Prompt --> AI
    AI -->|"suggestion text"| Route
    Route -->|"response"| Fetcher
    Fetcher --> State
    State --> Render
    Render --> Widget
    Keymap -->|"Tab pressed"| State

    style State fill:#e1f5ff
    style AI fill:#fff4cc
    style Widget fill:#d4f1d4
```

## Cấu Trúc Thư Mục

```text
src/
├── app/api/suggestion/          # Server-side
│   ├── route.ts                 # API endpoint (POST)
│   ├── schema.ts                # Zod schema (shared client/server)
│   └── prompt.ts                # Prompt template + builder
│
└── features/editor/extensions/suggestion/  # Client-side
    ├── index.ts                 # Barrel file (kết hợp tất cả)
    ├── state.ts                 # StateEffect + StateField
    ├── widget.ts                # SuggestionWidget (ghost text DOM)
    ├── payload.ts               # Tạo payload từ editor context
    ├── fetcher.ts               # Gọi API bằng ky
    ├── debounce-plugin.ts       # Debounce + trigger fetch
    ├── render-plugin.ts         # Render ghost text decoration
    └── accept-keymap.ts         # Tab để chấp nhận
```

## Luồng Chạy Code Chi Tiết (File → File)

Dưới đây là **thứ tự chính xác** code chạy qua từng file, từ lúc user gõ phím đến lúc ghost text hiển thị.

### Luồng 1: Trigger Suggestion (User gõ code → Ghost text xuất hiện)

```mermaid
sequenceDiagram
    participant User as 👤 User
    participant CE as code-editor.tsx
    participant Idx as index.ts
    participant DP as debounce-plugin.ts
    participant PL as payload.ts
    participant FT as fetcher.ts
    participant SC as schema.ts
    participant RT as route.ts
    participant PM as prompt.ts
    participant AI as 🤖 Gemini AI
    participant ST as state.ts
    participant RP as render-plugin.ts
    participant WG as widget.ts

    User->>CE: Gõ phím trong editor
    Note over CE: CodeEditor mount → load extensions
    CE->>Idx: suggestion(fileName)
    Note over Idx: Return [suggestionState, debouncePlugin, renderPlugin, keymap]

    Note over DP: docChanged detected!
    DP->>DP: clearTimeout (reset timer cũ)
    DP->>DP: abortController.abort() (hủy request cũ)
    DP->>DP: setTimeout(300ms)
    Note over DP: ⏱️ Chờ 300ms...

    DP->>PL: generatePayload(view, fileName)
    PL-->>DP: SuggestionRequest payload

    DP->>FT: fetcher(payload, signal)
    FT->>SC: suggestionRequestSchema.parse(payload)
    SC-->>FT: validated payload ✅

    FT->>RT: POST /api/suggestion (HTTP)
    RT->>SC: suggestionRequestSchema.parse(body)
    SC-->>RT: validated body ✅
    RT->>PM: buildSuggestionPrompt(payload)
    PM-->>RT: prompt string
    RT->>AI: generateText(prompt)
    AI-->>RT: { suggestion: "code gợi ý" }
    RT-->>FT: JSON { suggestion: "..." }

    FT->>SC: suggestionResponseSchema.parse(response)
    SC-->>FT: validated response ✅
    FT-->>DP: "code gợi ý"

    DP->>ST: dispatch setSuggestionEffect.of("code gợi ý")
    Note over ST: suggestionState = "code gợi ý"

    ST->>RP: state changed → rebuild decorations
    RP->>ST: view.state.field(suggestionState)
    ST-->>RP: "code gợi ý"
    RP->>WG: new SuggestionWidget("code gợi ý")
    WG-->>RP: DOM span (opacity: 0.4)
    RP-->>User: 👻 Ghost text hiển thị!
```

**Giải thích từng bước:**

| Bước | File                 | Hành động                                                                          |
| ---- | -------------------- | ---------------------------------------------------------------------------------- |
| 1    | `code-editor.tsx`    | Component mount → gọi `suggestion(fileName)` từ `index.ts`                         |
| 2    | `index.ts`           | Trả về array extensions: `[suggestionState, debouncePlugin, renderPlugin, keymap]` |
| 3    | `debounce-plugin.ts` | Phát hiện `docChanged` → reset timer → đặt timer 300ms mới                         |
| 4    | `debounce-plugin.ts` | Sau 300ms → gọi `generatePayload()`                                                |
| 5    | `payload.ts`         | Trích xuất code context từ editor → trả về `SuggestionRequest` object              |
| 6    | `fetcher.ts`         | Validate payload bằng `schema.ts` → POST lên `/api/suggestion`                     |
| 7    | `schema.ts`          | Validate request body (dùng chung cho cả client lẫn server)                        |
| 8    | `route.ts`           | Nhận request → validate → gọi `buildSuggestionPrompt()`                            |
| 9    | `prompt.ts`          | Thay placeholder trong template → trả về prompt string                             |
| 10   | `route.ts`           | Gọi Gemini AI → nhận suggestion → trả JSON response                                |
| 11   | `fetcher.ts`         | Validate response bằng `schema.ts` → trả suggestion text                           |
| 12   | `debounce-plugin.ts` | Dispatch `setSuggestionEffect` vào `state.ts`                                      |
| 13   | `state.ts`           | `suggestionState` cập nhật = "code gợi ý"                                          |
| 14   | `render-plugin.ts`   | Phát hiện state thay đổi → tạo `SuggestionWidget` từ `widget.ts`                   |
| 15   | `widget.ts`          | Tạo `<span>` element với opacity 0.4 → ghost text xuất hiện                        |

---

### Luồng 2: Accept Suggestion (User nhấn Tab → Code được chèn)

```mermaid
sequenceDiagram
    participant User as 👤 User
    participant AK as accept-keymap.ts
    participant ST as state.ts
    participant CM as CodeMirror Editor
    participant RP as render-plugin.ts

    User->>AK: Nhấn Tab
    AK->>ST: view.state.field(suggestionState)
    ST-->>AK: "code gợi ý" (hoặc null)

    alt Có suggestion
        AK->>CM: dispatch changes (chèn text tại v0dev)
        AK->>ST: dispatch setSuggestionEffect.of(null)
        Note over ST: suggestionState = null
        ST->>RP: state changed → rebuild
        RP-->>User: Ghost text biến mất, code thật xuất hiện ✅
    else Không có suggestion
        AK-->>CM: return false (Tab indent bình thường)
    end
```

**Giải thích:**

| Bước | File               | Hành động                                             |
| ---- | ------------------ | ----------------------------------------------------- |
| 1    | `accept-keymap.ts` | Intercept phím Tab                                    |
| 2    | `state.ts`         | Kiểm tra có suggestion không                          |
| 3a   | `accept-keymap.ts` | **Có**: Chèn suggestion text vào editor + xóa state   |
| 3b   | `accept-keymap.ts` | **Không**: Return `false` → Tab hoạt động bình thường |
| 4    | `render-plugin.ts` | State = null → ghost text biến mất                    |

---

### Tổng hợp: File nào gọi file nào?

```mermaid
flowchart LR
    subgraph Entry["🚪 Entry Point"]
        CE["code-editor.tsx"]
    end

    subgraph Barrel["📦 Barrel"]
        IDX["index.ts"]
    end

    subgraph Trigger["⚡ Trigger Flow"]
        DP["debounce-plugin.ts"]
        PL["payload.ts"]
        FT["fetcher.ts"]
    end

    subgraph State["💾 State"]
        ST["state.ts"]
    end

    subgraph Display["👁️ Display"]
        RP["render-plugin.ts"]
        WG["widget.ts"]
        AK["accept-keymap.ts"]
    end

    subgraph API["☁️ Server"]
        SC["schema.ts"]
        RT["route.ts"]
        PM["prompt.ts"]
    end

    CE -->|"import suggestion()"| IDX
    IDX -->|"import"| ST
    IDX -->|"import"| DP
    IDX -->|"import"| RP
    IDX -->|"import"| AK

    DP -->|"import"| PL
    DP -->|"import"| FT
    DP -->|"import"| ST

    FT -->|"import"| SC
    FT -.->|"HTTP POST"| RT

    RP -->|"import"| ST
    RP -->|"import"| WG

    AK -->|"import"| ST

    RT -->|"import"| SC
    RT -->|"import"| PM

    style CE fill:#e1f5ff
    style IDX fill:#fff4cc
    style ST fill:#ffd6e8
    style SC fill:#d4f1d4
```

> [!TIP]
> Đường nét liền (`→`) = **import trực tiếp** (cùng codebase). Đường nét đứt (`-.->`) = **HTTP request** (client → server).

---

## Giải Thích Chi Tiết Từng File

### 1. `schema.ts` — Validation chung (Server + Client)

> [!TIP]
> File này được **shared** giữa server và client để đảm bảo type-safety end-to-end.

```typescript
// Zod schema định nghĩa dữ liệu request gửi lên API
export const suggestionRequestSchema = z.object({
  fileName: z.string(), // Tên file đang edit
  code: z.string(), // Toàn bộ code
  currentLine: z.string(), // Dòng hiện tại
  previousLines: z.string(), // 5 dòng phía trước
  textBeforeV0dev: z.string(), // Text trước v0dev trên dòng hiện tại
  textAfterV0dev: z.string(), // Text sau v0dev trên dòng hiện tại
  nextLines: z.string(), // 5 dòng phía sau
  lineNumber: z.number(), // Số dòng hiện tại
});

// Zod schema cho response từ AI
export const suggestionResponseSchema = z.object({
  suggestion: z.string(),
});

// Type infer tự động từ schema → dùng trong TypeScript
export type SuggestionRequest = z.infer<typeof suggestionRequestSchema>;
export type SuggestionResponse = z.infer<typeof suggestionResponseSchema>;
```

**Tại sao shared?** Vì client (`fetcher.ts`) validate payload trước khi gửi, và server (`route.ts`) validate lại khi nhận. Dùng chung 1 schema đảm bảo không bị lệch type.

---

### 2. `state.ts` — Quản lý trạng thái suggestion

```typescript
// StateEffect = "message" để cập nhật state
const setSuggestionEffect = StateEffect.define<string | null>();

// StateField = "nơi lưu trữ" suggestion text
const suggestionState = StateField.define<string | null>({
  create() {
    return null;
  }, // Khởi tạo: không có suggestion
  update(value, transaction) {
    for (const effect of transaction.effects) {
      if (effect.is(setSuggestionEffect)) {
        return effect.value; // Có effect mới → cập nhật
      }
    }
    return value; // Không có → giữ nguyên
  },
});
```

**Ví dụ trực quan:**

```text
Bạn gõ "cons" → debounce chờ 300ms → AI trả về "t myVar = 42;"
→ dispatch setSuggestionEffect.of("t myVar = 42;")
→ suggestionState cập nhật thành "t myVar = 42;"
→ renderPlugin đọc state này → hiển thị ghost text
```

---

### 3. `payload.ts` — Tạo context payload

Hàm `generatePayload()` trích xuất thông tin từ editor:

```text
Dòng 1: import React from 'react';
Dòng 2:
Dòng 3: const App = () => {
Dòng 4:   return (
Dòng 5:     <div>Hel|lo</div>     ← v0dev ở đây (|)
Dòng 6:   );
Dòng 7: };
```

→ Payload gửi lên API:

```json
{
  "fileName": "App.tsx",
  "currentLine": "    <div>Hello</div>",
  "textBeforeV0dev": "    <div>Hel",
  "textAfterV0dev": "lo</div>",
  "previousLines": "import React...\n\nconst App...\n  return (",
  "nextLines": "  );\n};",
  "lineNumber": 5
}
```

---

### 4. `debounce-plugin.ts` — Debounce + Fetch

```text
Bạn gõ "c" → timer bắt đầu (300ms)
Bạn gõ "o" → timer reset (300ms mới)
Bạn gõ "n" → timer reset (300ms mới)
Bạn gõ "s" → timer reset (300ms mới)
[300ms trôi qua, bạn ngừng gõ]
→ generatePayload() → fetcher() → API → suggestion text
```

> [!IMPORTANT]
> **Cải thiện SOLID**: Mutable state (`debounceTimer`, `abortController`) nằm trong **class instance** thay vì module-level variables. Nếu có nhiều editor instances, mỗi cái sẽ có timer riêng.

---

### 5. `render-plugin.ts` — Hiển thị ghost text

Khi `suggestionState` có giá trị (không null):

- Tạo `SuggestionWidget` với text suggestion
- Dán widget vào vị trí v0dev dưới dạng `Decoration`
- Ghost text hiển thị với opacity 0.4 (chữ mờ)

---

### 6. `accept-keymap.ts` — Nhấn Tab để chấp nhận

```text
Trước khi nhấn Tab:
  const myVar = |42;        ← v0dev (|), ghost text "42;"

Sau khi nhấn Tab:
  const myVar = 42;|        ← ghost text được chèn, v0dev di chuyển
```

---

### 7. `prompt.ts` — Xây dựng prompt cho AI

Dùng template string với các placeholder (`{fileName}`, `{code}`, etc.) và hàm `buildSuggestionPrompt()` thay thế chúng bằng giá trị thực từ payload.

---

### 8. `route.ts` — API endpoint

Luồng xử lý:

1. **Auth check** → Clerk verify userId
2. **Validate body** → Zod parse request body
3. **Build prompt** → Thay placeholder bằng context
4. **AI generate** → Gemini tạo suggestion
5. **Return** → JSON response với suggestion text

---
