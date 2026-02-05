# Architectural Decision Record: Projects Feature Refactoring

> [!NOTE]
> Tài liệu này giải thích **Lý do (Why)** và **Cách thức (How)** chúng ta tổ chức code cho tính năng Projects. Mục tiêu là giúp developer hiểu được tư duy đằng sau các thay đổi chứ không chỉ là đọc code.

## 1. Tại sao phải Refactor? (The "Why")

Trước khi refactor, code có những vấn đề "ngầm" thường gặp:

1.  **Lặp lại logic (Duplication)**: Đoạn code kiểm tra `importStatus` để chọn Icon xuất hiện ở 2-3 nơi. Nếu muốn đổi icon "Importing" từ _Loader_ sang _Spinner_, ta phải sửa ở 3 chỗ.
2.  **Ôm đồm trách nhiệm (God Component)**: `ProjectsList` vừa lo việc fetch data, vừa lo việc hiển thị UI của từng row, vừa lo format ngày tháng, vừa lo chọn icon. File trở nên dài và khó đọc.
3.  **Khó mở rộng**: Nếu muốn dùng logic hiển thị Project ở một chỗ mới (ví dụ: Sidebar), ta phải copy-paste code.

Chúng ta áp dụng **SOLID** để giải quyết vấn đề này.

---

## 2. Chi tiết các thay đổi & Giải thích

### 2.1. Tách `ProjectIcon` Component

**Nguyên tắc áp dụng**: _Single Responsibility Principle (SRP) - Nguyên tắc đơn nhiệm._ & _Don't Repeat Yourself (DRY)._

- **Trước đây (Before)**:
  Trong `projects-list.tsx` và `projects-command-dialog.tsx` đều có một hàm `getProjectIcon(status)` giống hệt nhau.
- **Vấn đề**:
  Code lặp lại. Logic UI (hiển thị icon) bị trộn lẫn với logic của danh sách.
- **Giải pháp (After)**:
  Tách riêng ra file `project-icon.tsx`.
- **Lợi ích**:
  - **Tái sử dụng**: Bất kỳ đâu cần hiển thị icon project, chỉ cần gọi `<ProjectIcon importStatus={...} />`.
  - **Dễ thay đổi**: Muốn đổi bộ icon? Chỉ cần sửa 1 file duy nhất.
  - **Dễ đọc**: Component cha (`ProjectsList`) gọn hơn vì không còn chứa code xử lý icon loằng ngoằng.

### 2.2. Tổ chức lại `ProjectsList`

**Nguyên tắc áp dụng**: _Decomposition (Chia nhỏ)._

- **Trước đây**:
  Một component khổng lồ render cả Loading state, Empty state, và danh sách items.
- **Giải pháp**:
  Chia nhỏ thành các sub-components ngay trong file (hoặc tách ra nếu cần tái sử dụng):
  - `ContinueCard`: Card lớn hiển thị project mới nhất.
  - `ProjectItem`: Các dòng project trong danh sách dưới.
- **Lợi ích**:
  Người đọc code sẽ thấy cấu trúc rõ ràng:
  ```tsx
  // Dễ hình dung bố cục ngay lập tức
  return (
    <div>
      <ContinueCard data={mostRecent} />
      <ul>
        {rest.map((p) => (
          <ProjectItem data={p} />
        ))}
      </ul>
    </div>
  );
  ```

### 2.3. Sửa lỗi logic "Dynamic Project Name" trong `ProjectView`

**Vấn đề thực tế (Bug)**:
Dù không liên quan trực tiếp đến SOLID, nhưng đây là lỗi tư duy phổ biến.

- **Code cũ**:

  ```tsx
  // Biến này chỉ chạy 1 lần khi file được load!
  const randomName = uniqueNamesGenerator(...)

  const ProjectView = () => {
     // Mỗi lần bấm Create, nó vẫn dùng lại cái 'randomName' cũ kia
     createProject({ name: randomName })
  }
  ```

- **Hậu quả**:
  Nếu người dùng không reload trang, họ tạo 10 project thì cả 10 đều trùng tên.
- **Giải pháp**:
  Chuyển logic tạo tên thành hàm (`generateProjectName`) và gọi nó **tại thời điểm bấm nút**.
  ```tsx
  onClick={() => createProject({ name: generateProjectName() })}
  ```

---

## 3. Tổng kết kiến trúc hiện tại

Hệ thống được chia theo **luồng dữ liệu một chiều (Unidirectional Data Flow)** rõ ràng:

1.  **UI Components (`src/features/projects/components`)**:
    - Chỉ lo việc "Hiển thị cái gì".
    - Không chứa logic gọi database trực tiếp.
    - Nhận dữ liệu qua Props hoặc Custom Hooks.

2.  **Hooks Layer (`src/features/projects/hooks`)**:
    - Cầu nối giữa UI và Backend.
    - Chứa logic data fetching (`useProjects`) và mutations (`useCreateProject`).
    - Che giấu sự phức tạp của thư viện bên dưới (Convex).

3.  **Backend Layer (`convex/projects.ts`)**:
    - Chỉ lo việc "Làm sao để lấy/lưu dữ liệu an toàn".
    - Kiểm tra quyền (`verifyAuth`).
    - Truy vấn Database.

Cách tổ chức này giúp code **Dễ Test**, **Dễ Debug** (lỗi ở đâu sửa ở đó, UI lỗi thì sửa UI, Data lỗi thì sửa Hooks/Backend), và **Dễ cho người mới** (dễ dàng tìm thấy logic cần thiết).
