# V0-dev: Database Setup (Convex)

## 1. Convex là gì?

- **Convex** là một nền tảng backend-as-a-service (BaaS) được thiết kế đặc biệt cho các ứng dụng web hiện đại, đặc biệt là React và Next.js. Nó cung cấp một cơ sở dữ liệu thời gian thực (realtime database) với khả năng đồng bộ hóa dữ liệu tự động giữa server và client.

- Với Convex, bạn có thể viết các hàm backend bằng TypeScript, định nghĩa schema cho database, và tự động có được type-safety hoàn toàn từ backend đến frontend mà không cần phải viết thêm code.

### 1.1 Tại sao bạn cần Convex?

- **Type-Safety Hoàn Toàn**: Convex tự động generate TypeScript types từ schema và functions của bạn. Điều này có nghĩa là bạn sẽ có autocomplete và type checking từ backend đến frontend mà không cần phải viết thêm code.

- **Realtime by Default**: Mọi query trong Convex đều là realtime. Khi dữ liệu thay đổi trên server, UI của bạn sẽ tự động cập nhật mà không cần phải viết thêm code WebSocket hay polling.

- **Serverless Functions**: Bạn có thể viết các hàm backend (queries, mutations, actions) bằng TypeScript ngay trong dự án của mình. Không cần phải setup server riêng hay lo lắng về scaling.

- **Developer Experience Tuyệt Vời**: Convex cung cấp một dashboard trực quan để quản lý dữ liệu, xem logs, và debug. Nó cũng có hot-reload cho backend code, giúp bạn phát triển nhanh hơn.

- **Tích Hợp Hoàn Hảo với Next.js**: Convex được thiết kế để hoạt động mượt mà với Next.js App Router, hỗ trợ cả Server Components và Client Components.

### 1.2 Cách thức hoạt động của Convex

- Convex hoạt động theo mô hình client-server với một số đặc điểm độc đáo:
  1. **Schema Definition**: Bạn định nghĩa schema cho database bằng TypeScript trong thư mục `convex/`.
  2. **Functions**: Bạn viết các hàm backend (queries, mutations, actions) cũng trong thư mục `convex/`.
  3. **Code Generation**: Convex CLI tự động generate TypeScript types và API client từ schema và functions của bạn.
  4. **Realtime Sync**: Khi bạn sử dụng `useQuery` hook trong React, Convex tự động subscribe vào dữ liệu và cập nhật UI khi có thay đổi.

## 2. Cài đặt và Cấu hình Convex

### 2.1 Cài đặt Convex

- Mở terminal tại thư mục gốc của dự án và chạy lệnh:

```bash
npm install convex
```

### 2.2 Khởi tạo Convex trong dự án

- Chạy lệnh sau để khởi tạo Convex:

```bash
npx convex dev
```

- Lệnh này sẽ:
  - Tạo thư mục `convex/` trong dự án của bạn
  - Yêu cầu bạn đăng nhập vào Convex (hoặc tạo tài khoản mới)
  - Tạo một project mới trên Convex dashboard
  - Tự động thêm `NEXT_PUBLIC_CONVEX_URL` vào file `.env.local`
  - Bắt đầu watch mode để sync code với Convex cloud

### 2.3 Cấu hình Environment Variables

- Sau khi chạy `npx convex dev`, file `.env.local` sẽ được tạo tự động với nội dung:

```env
# Deployment used by `npx convex dev`
CONVEX_DEPLOYMENT=dev:your-deployment-name
NEXT_PUBLIC_CONVEX_URL=https://your-deployment-name.convex.cloud
```

> [!NOTE]
> File `.env.local` sẽ được tự động tạo và cập nhật bởi Convex CLI. Bạn không cần phải thêm thủ công.

## 3. Định nghĩa Schema

### 3.1 Tạo Schema cho Database

- Mở file `convex/schema.ts` và định nghĩa schema cho các bảng (tables) của bạn:

```typescript
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  project: defineTable({
    name: v.string(),
    ownerId: v.string(),
    importStatus: v.optional(
      v.union(v.literal("importing"), v.literal("success"), v.literal("failed"))
    ),
  }).index("by_owner", ["ownerId"]),
});
```

### 3.2 Giải thích Schema

- **defineSchema**: Hàm này định nghĩa toàn bộ schema cho database của bạn.

- **defineTable**: Định nghĩa một bảng (table) trong database. Mỗi bảng có một tên (ví dụ: `project`) và một schema cho các trường (fields).

- **v.string(), v.number(), v.boolean()**: Các validator để định nghĩa kiểu dữ liệu cho từng trường.

- **v.optional()**: Đánh dấu một trường là không bắt buộc (có thể undefined).

- **v.union()**: Cho phép một trường có nhiều kiểu dữ liệu hoặc giá trị khác nhau.

- **v.literal()**: Định nghĩa một giá trị cụ thể (literal value).

- **.index()**: Tạo index cho bảng để tăng tốc độ query. Ví dụ: `index("by_owner", ["ownerId"])` tạo index trên trường `ownerId`.

> [!IMPORTANT]
> Mỗi document trong Convex tự động có các trường: `_id` (ID duy nhất), `_creationTime` (thời gian tạo). Bạn không cần định nghĩa các trường này trong schema.

## 4. Viết Functions (Queries và Mutations)

### 4.1 Tạo file Functions

- Tạo file `convex/project.ts` để chứa các functions liên quan đến bảng `project`:

```typescript
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const create = mutation({
  args: {
    name: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("project", {
      name: args.name,
      ownerId: "",
    });
  },
});

export const get = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("project").collect();
  },
});
```

### 4.2 Giải thích Functions

#### Query Functions

- **query**: Dùng để đọc dữ liệu từ database. Query functions là read-only và không thể thay đổi dữ liệu.

- **args**: Định nghĩa các tham số đầu vào cho function. Sử dụng validators từ `convex/values`.

- **handler**: Hàm xử lý logic. Nhận vào `ctx` (context) và `args` (arguments).

- **ctx.db.query()**: API để query dữ liệu từ database.

- **.collect()**: Lấy tất cả kết quả từ query.

#### Mutation Functions

- **mutation**: Dùng để thay đổi dữ liệu trong database (create, update, delete).

- **ctx.db.insert()**: Thêm một document mới vào bảng.

- **ctx.db.patch()**: Cập nhật một document (không được sử dụng trong ví dụ trên).

- **ctx.db.delete()**: Xóa một document (không được sử dụng trong ví dụ trên).

> [!TIP]
> Convex tự động generate TypeScript types cho tất cả functions của bạn. Bạn có thể import và sử dụng chúng với full type-safety.

## 5. Tích hợp Convex vào Next.js

### 5.1 Tạo Convex Provider

- Tạo file `src/components/convex-client-provider.tsx`:

```tsx
"use client";

import { ConvexProvider, ConvexReactClient } from "convex/react";
import { ReactNode } from "react";

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  return <ConvexProvider client={convex}>{children}</ConvexProvider>;
}
```

### 5.2 Cấu hình Layout

- Mở file `src/app/layout.tsx` và wrap ứng dụng với `ConvexClientProvider`:

```tsx
import { ConvexClientProvider } from "@/components/convex-client-provider";
import { ThemeProvider } from "@/components/theme-provider";
import { ClerkProvider } from "@clerk/nextjs";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <head />
        <body>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
            <ConvexClientProvider>{children}</ConvexClientProvider>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
```

> [!IMPORTANT]
> `ConvexClientProvider` phải được đặt bên trong `ThemeProvider` và `ClerkProvider` để đảm bảo tất cả providers hoạt động đúng cách.

## 6. Sử dụng Convex trong Components

### 6.1 Sử dụng useQuery và useMutation

- Tạo hoặc mở file `src/app/page.tsx`:

```tsx
"use client";

import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Doc } from "../../convex/_generated/dataModel";

export default function Home() {
  const projects = useQuery(api.project.get);
  const createProject = useMutation(api.project.create);

  return (
    <div className="flex flex-col gap-2 p-4">
      <button
        onClick={() => createProject({ name: "Test Project" })}
        className="bg-blue-500 text-white rounded-full font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 cursor-pointer"
      >
        Create Project
      </button>

      {projects?.map((project: Doc<"project">) => (
        <div key={project._id} className="border rounded p-2 flex flex-col">
          <p>{project.name}</p>
          <p>{project._id}</p>
        </div>
      ))}
    </div>
  );
}
```

### 6.2 Giải thích Code

- **useQuery**: Hook để đọc dữ liệu từ Convex. Tự động subscribe và cập nhật khi dữ liệu thay đổi.

- **useMutation**: Hook để thực hiện mutations (thay đổi dữ liệu).

- **api**: Object được generate tự động từ Convex CLI, chứa tất cả functions của bạn với full type-safety.

- **Doc<"project">**: Type được generate tự động cho documents trong bảng `project`.

> [!TIP]
> `useQuery` trả về `undefined` trong lần render đầu tiên khi đang load dữ liệu. Sử dụng optional chaining (`?.`) để tránh lỗi.

## 7. Chạy Convex Development Server

### 7.1 Khởi động Convex Dev

- Mở terminal mới và chạy:

```bash
npx convex dev
```

- Lệnh này sẽ:
  - Watch các thay đổi trong thư mục `convex/`
  - Tự động sync code với Convex cloud
  - Generate TypeScript types mỗi khi có thay đổi
  - Hiển thị logs từ backend functions

### 7.2 Chạy Next.js Dev Server

- Mở terminal khác và chạy:

```bash
npm run dev
```

> [!NOTE]
> Bạn cần chạy cả hai lệnh `npx convex dev` và `npm run dev` đồng thời trong hai terminal khác nhau để phát triển ứng dụng.

## 8. Convex Dashboard

### 8.1 Truy cập Dashboard

- Truy cập: https://dashboard.convex.dev/

- Tại đây bạn có thể:
  - Xem và chỉnh sửa dữ liệu trong database
  - Xem logs từ backend functions
  - Monitor performance
  - Quản lý deployments
  - Xem schema và functions

### 8.2 Sử dụng Data Browser

- Trong dashboard, click vào tab "Data" để xem tất cả bảng và documents.

- Bạn có thể:
  - Thêm, sửa, xóa documents trực tiếp
  - Filter và search dữ liệu
  - Export/Import dữ liệu

## 9. Best Practices

### 9.1 Tổ chức Code

```bash
convex/
├── _generated/        # Auto-generated, không chỉnh sửa
├── schema.ts          # Định nghĩa schema cho toàn bộ database
├── project.ts         # Functions cho bảng project
├── user.ts            # Functions cho bảng user
└── utils.ts           # Helper functions dùng chung
```

### 9.2 Naming Conventions

- **Tables**: Sử dụng số ít, lowercase (ví dụ: `project`, `user`, `task`)
- **Functions**: Sử dụng camelCase (ví dụ: `getProjects`, `createProject`)
- **Indexes**: Sử dụng prefix `by_` (ví dụ: `by_owner`, `by_status`)

### 9.3 Type Safety

- Luôn sử dụng `Doc<"tableName">` type cho documents
- Sử dụng `api` object được generate để gọi functions
- Không bao giờ sử dụng `any` type

### 9.4 Error Handling

```tsx
const projects = useQuery(api.project.get);

if (projects === undefined) {
  return <div>Loading...</div>;
}

if (projects.length === 0) {
  return <div>No projects found</div>;
}

return <div>{/* Render projects */}</div>;
```

## 10. Tóm tắt

- **Convex** là một BaaS platform mạnh mẽ cho Next.js với realtime database và type-safety hoàn toàn.

- **Setup đơn giản**: Chỉ cần `npm install convex` và `npx convex dev`.

- **Schema-first**: Định nghĩa schema bằng TypeScript, Convex tự động generate types.

- **Realtime by default**: Mọi query đều tự động cập nhật khi dữ liệu thay đổi.

- **Developer Experience**: Dashboard trực quan, hot-reload, và type-safety hoàn toàn.

> [!CAUTION]
> Nhớ chạy cả `npx convex dev` và `npm run dev` đồng thời khi phát triển. Nếu không, code của bạn sẽ không được sync với Convex cloud.
