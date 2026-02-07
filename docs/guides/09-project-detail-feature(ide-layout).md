# Architectural Decision Record: Project Detail Feature

> [!NOTE]
> Tài liệu này giải thích thiết kế của trang chi tiết dự án (Project Detail), nơi người dùng tương tác chính với code và preview.

## 1. Cấu Trúc Layout & UI

### 1.1. Resizable Layout (`ProjectIdLayout`)

**Vấn đề**:
Layout 2 cột (Sidebar/Main) cần có khả năng thay đổi kích thước để người dùng tùy chỉnh không gian làm việc.

**Giải pháp**:
Sử dụng `allotment` để tạo Split Pane.

- **Conversation Sidebar**: Chat với AI.
- **Main Content**: Chứa Editor vả Preview.

### 1.2. Navbar Refactoring (SOLID)

**Nguyên tắc**: _Single Responsibility Principle (SRP)_.

Trước khi refactor, `Navbar` xử lý quá nhiều việc: hiển thị breadcrumbs, quản lý state đổi tên, hiển thị trạng thái lưu.
Chúng ta đã tách thành:

1.  **`Navbar`**: Chỉ đóng vai trò container layout.
2.  **`ProjectTitleRenamer`**:
    - Quản lý state `isRenaming`.
    - Xử lý logic submit đổi tên (`useRenameProject`).
    - Hiển thị Input hoặc Text.
3.  **`ProjectSaveStatus`**:
    - Lắng nghe `importStatus` của project.
    - Hiển thị Icon thích hợp (Cloud Check, Loader).

## 2. Quản Lý State & Data Flow

### 2.1. Optimistic Updates cho Rename

**Mục tiêu**: UI phản hồi tức thì khi người dùng đổi tên.

**Implementation**:
Hook `useRenameProject` trong `use-projects.ts` sử dụng `optimisticUpdate` của Convex:

1.  Người dùng nhấn Enter.
2.  Optimistic update chạy: Update cache cục bộ ngay lập tức -> Tên dự án đổi trên UI.
3.  Server mutation chạy sau đó để đồng bộ vào DB.

### 2.2. View State (`ProjectIdView`)

Sử dụng state cục bộ để chuyển tab:

- **Editor**: Xem code.
- **Preview**: Xem kết quả chạy code.

## 3. Backend (Convex)

### `api.projects.getById`

Lấy chi tiết dự án. Có kiểm tra bảo mật:

```typescript
if (project.ownerId !== identity.subject) {
  throw new Error("Unauthorized");
}
```

### `api.projects.rename`

Mutation đổi tên, cập nhật `updatedAt`.
