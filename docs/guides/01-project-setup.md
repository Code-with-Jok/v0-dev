# V0-dev: Project Setup (NextJS + TypeScript + TailwindCSS + shadcn/ui + NextThemes) - Part 1

## 1. Next.js là gì?

- **Next.js** là một Framework dành cho React, được tạo ra bởi Vercel. Nếu React là "thư viện" cung cấp các viên gạch để xây nhà, thì Next.js là một "bộ khung hoàn chỉnh" giúp bạn xây nhà nhanh hơn, chắc chắn hơn và có sẵn hệ thống điện nước (tối ưu hóa).

### Tạo sao chúng ta nên dùng Nextjs thay vì React thuần?

1. **SEO (Search Engine Optimization)**: Next.js hỗ trợ Server-Side Rendering (SSR) và Static Site Generation (SSG), giúp các công cụ tìm kiếm dễ dàng đọc và index nội dung trang web của bạn.
2. **Performance**: Next.js tối ưu hóa hiệu suất trang web bằng cách sử dụng SSR, SSG, Code Splitting, và Image Optimization.
3. **Fullstack**: Bạn có thể viết cả mã Frontend và Backend (API) trong cùng một dự án.

### Hướng dẫn Setup NextJS cho V0-dev

- Mở terminal tại thư mục gốc của dự án
- Chạy lệnh: `npx create-next-app@latest`
- Chọn các tùy chọn sau:

```bash
  - Project name: `v0-dev`
  - Would you like to use TypeScript? → Yes
  - Would you like to use ESLint? → Yes
  - Would you like to use Tailwind CSS? → Yes
  - Would you like to use `src/` directory? → Yes
  - Would you like to use App Router (recommended)? → Yes
  - Would you like to customize the default import alias? → No
```

Di chuyển vào thư mục dự án và khởi động môi trường dev

```bash
cd v0-dev
npm run dev
```

Bây giờ, hãy mở trình duyệt và truy cập: http://localhost:3000. Bạn sẽ thấy trang chào mừng của Next.js!

## 2. Shadcn/ui

- Shadcn UI là một bộ sưu tập các thành phần giao diện (UI components) React có thể tái sử dụng, được xây dựng trên nền tảng Tailwind CSS và Radix UI.

- Điểm đột phá là nó không phải là thư viện npm truyền thống, mà hoạt động theo cơ chế sao chép/dán mã nguồn (copy-paste) trực tiếp vào dự án, cho phép lập trình viên toàn quyền kiểm soát và tùy chỉnh mã.

### Cấu trúc của shadcn/ui

```bash

my-nextjs-app/
├── src/
│   ├── components/
│   │   └── ui/          <-- Nơi chứa các component bạn 'add' về (Button, Input...)
│   ├── lib/
│   │   └── utils.ts     <-- Hàm bổ trợ để quản lý class Tailwind gọn gàng
│   └── app/
│       └── globals.css  <-- Chứa các biến màu sắc (CSS Variables) của hệ thống
├── components.json      <-- File cấu hình của shadcn/ui

```

### Quy trình làm việc với Shadcn/ui

#### Bước 1: Tìm và thêm component

- Truy cập trang web của shadcn/ui: https://ui.shadcn.com/
- Tìm kiếm component bạn muốn sử dụng
- Nhấn vào nút "Add" để thêm component vào dự án
- Chạy lệnh: `npx shadcn-ui add <component-name>` để thêm component vào dự án

#### Bước 2: Kiểm tra và Tùy chỉnh (Customize)

- Mã nguồn sẽ xuất hiện tại src/components/ui/alert-dialog.tsx. Bạn có thể mở ra để đổi màu, đổi font hoặc thêm logic riêng.

#### Bước 3: Sử dụng

```jsx
import { Button } from "@/components/ui/button";

export default function Home() {
  return <Button>Click me</Button>;
}
```

## 3. Next-themes

- **next-themes** là một thư viện nhỏ nhưng cực kỳ mạnh mẽ dành riêng cho Next.js, giúp bạn quản lý việc chuyển đổi giao diện (Themes) một cách hoàn hảo.

- Nó giải quyết một vấn đề rất khó chịu trong lập trình web gọi là "Hydration Mismatch" (hiện tượng trang web bị nhấp nháy màu trắng một vài miligiây trước khi chuyển sang màu tối khi bạn tải lại trang).

### 1. Tại sao bạn cần next-themes?

- Nếu bạn tự viết code để chuyển đổi Dark Mode, bạn sẽ gặp nhiều rắc rối. next-themes giúp bạn xử lý tất cả:

  - **Tự động nhận diện hệ thống**: Nếu máy tính của người dùng đang để chế độ Dark Mode, trang web của bạn sẽ tự động chuyển sang Dark Mode ngay lần đầu truy cập.

  - **Lưu trữ tùy chọn**: Nó tự động lưu lựa chọn của người dùng vào localStorage, lần sau họ quay lại trang web, màu sắc vẫn đúng như họ đã chọn.

  - **Đồng bộ hóa các Tab**: Nếu người dùng mở 2 tab web của bạn và đổi màu ở tab 1, tab 2 cũng sẽ tự đổi theo ngay lập tức.

  - **Hỗ trợ hoàn hảo cho Tailwind CSS**: Nó hoạt động bằng cách thêm/xóa class .dark vào thẻ <html>, rất khớp với cách Tailwind vận hành.

### 2. Hướng dẫn cài đặt next-themes

#### Bước 1: Cài đặt thư viện

```bash
npm install next-themes
```

#### Bước 2: Tạo Theme Provider

Vì Next.js (App Router) mặc định là Server Components, chúng ta cần tạo một file riêng để bọc ứng dụng lại. Hãy tạo file: `src/components/theme-provider.tsx`.

```jsx
"use client"; // Bắt buộc phải có vì theme cần chạy ở trình duyệt

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { type ThemeProviderProps } from "next-themes/dist/types";

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
```

#### Bước 3: Cấu hình Layout tổng

Mở `file src/app/layout.tsx`, nhập Provider vừa tạo và bọc toàn bộ nội dung ứng dụng lại.

```jsx
import { ThemeProvider } from "@/components/theme-provider";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode,
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      {" "}
      ///
      {/* suppressHydrationWarning là bắt buộc để tránh lỗi báo hiệu từ Next.js */}
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
```

### 4. Tạo nút chuyển đổi Theme

#### Bước 1: Cài thêm component Dropdown Menu từ shadcn:

```bash
npx shadcn@latest add dropdown-menu
```

#### Bước 2: Tạo file nút chuyển đổi

- Tạo file `src/components/mode-toggle.tsx` và dán đoạn mã sau (đoạn mã này sử dụng hook `useTheme` từ `next-themes`):

```jsx
"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function ModeToggle() {
  const { setTheme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Chuyển đổi giao diện</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme("light")}>
          Sáng
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>
          Tối
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")}>
          Hệ thống
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
```

### 5. Quy trình hoạt động tóm tắt

- Người dùng bấm nút: Hàm `setTheme('dark')` được gọi.
- `next-themes` xử lý: Thư viện sẽ thêm class `dark` vào thẻ `<html>`.
- `Tailwind CSS` phản hồi: Tất cả các thành phần có tiền tố `dark:` (ví dụ: `dark:bg-black`) sẽ tự động đổi màu.
