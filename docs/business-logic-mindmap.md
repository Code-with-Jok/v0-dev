# Business Logic Mindmap - V0 Dev Project

> [!NOTE]
> Tài liệu này mô tả luồng logic nghiệp vụ (business logic flow) của dự án V0 Dev thông qua các sơ đồ mindmap và flowchart.

## Tổng Quan Kiến Trúc Hệ Thống

```mermaid
graph TB
    User["👤 Người Dùng"]

    subgraph "Frontend Layer - Next.js 16"
        UI["🎨 UI Components<br/>(Radix UI + Tailwind)"]
        Pages["📄 Pages & Routes"]
        Providers["⚙️ Providers Layer"]
    end

    subgraph "Authentication Layer"
        Clerk["🔐 Clerk Authentication"]
        AuthViews["👁️ Auth Views<br/>(Loading, Unauthenticated)"]
    end

    subgraph "State Management"
        ConvexClient["🔄 Convex React Client"]
        Hooks["🪝 React Hooks<br/>(useQuery, useMutation)"]
    end

    subgraph "Backend Layer - Convex"
        AuthConfig["🛡️ Auth Config<br/>(JWT Validation)"]
        Schema["📊 Database Schema"]
        Mutations["✏️ Mutations"]
        Queries["🔍 Queries"]
    end

    subgraph "Database"
        ConvexDB["💾 Convex Database<br/>(Projects Table)"]
    end

    User --> UI
    UI --> Pages
    Pages --> Providers
    Providers --> Clerk
    Providers --> ConvexClient
    Providers --> AuthViews

    ConvexClient --> Hooks
    Hooks --> Mutations
    Hooks --> Queries

    Clerk --> AuthConfig
    AuthConfig --> Mutations
    AuthConfig --> Queries

    Mutations --> Schema
    Queries --> Schema
    Schema --> ConvexDB

    style User fill:#e1f5ff
    style Clerk fill:#ffd6e8
    style ConvexDB fill:#d4f1d4
```

## Luồng Xác Thực Người Dùng (Authentication Flow)

```mermaid
flowchart TD
    Start["🚀 Ứng Dụng Khởi Động"]
    CheckAuth{"🔍 Kiểm Tra<br/>Trạng Thái Auth"}

    Loading["⏳ AuthLoading State"]
    ShowLoadingView["📺 Hiển Thị<br/>AuthLoadingView<br/>(Spinner)"]

    Authenticated["✅ Authenticated State"]
    ShowUserButton["👤 Hiển Thị UserButton"]
    ShowContent["📄 Hiển Thị Nội Dung<br/>Chính (Children)"]

    Unauthenticated["❌ Unauthenticated State"]
    ShowUnauth["🚫 Hiển Thị<br/>unauthenticatedView"]
    SignInBtn["🔑 Nút Sign In"]
    SignUpBtn["📝 Nút Sign Up"]

    ClerkAuth["🔐 Clerk Authentication<br/>Process"]
    GetJWT["🎫 Lấy JWT Token"]
    ConvexAuth["✓ Convex Auth Config<br/>Xác Thực JWT"]

    Start --> CheckAuth

    CheckAuth -->|"Đang tải"| Loading
    Loading --> ShowLoadingView

    CheckAuth -->|"Đã đăng nhập"| Authenticated
    Authenticated --> ShowUserButton
    Authenticated --> ShowContent

    CheckAuth -->|"Chưa đăng nhập"| Unauthenticated
    Unauthenticated --> ShowUnauth
    ShowUnauth --> SignInBtn
    ShowUnauth --> SignUpBtn

    SignInBtn --> ClerkAuth
    SignUpBtn --> ClerkAuth
    ClerkAuth --> GetJWT
    GetJWT --> ConvexAuth
    ConvexAuth --> Authenticated

    style Start fill:#e1f5ff
    style Authenticated fill:#d4f1d4
    style Unauthenticated fill:#ffe4e4
    style ClerkAuth fill:#ffd6e8
```

## Luồng Quản Lý Dự Án (Project Management Flow)

```mermaid
flowchart TD
    HomePage["🏠 Home Page<br/>(page.tsx)"]

    subgraph "Data Fetching"
        UseQuery["🔍 useQuery<br/>(api.project.get)"]
        ConvexQuery["📡 Convex Query Handler"]
        CheckIdentity1{"🔐 Kiểm Tra<br/>User Identity"}
        QueryDB["💾 Query Database<br/>by_owner index"]
        ReturnProjects["📦 Trả Về<br/>Danh Sách Projects"]
    end

    subgraph "Project Creation"
        CreateBtn["➕ Nút Create Project"]
        UseMutation["✏️ useMutation<br/>(api.project.create)"]
        ConvexMutation["📡 Convex Mutation Handler"]
        CheckIdentity2{"🔐 Kiểm Tra<br/>User Identity"}
        Unauthorized["❌ Throw Error:<br/>Unauthorized"]
        InsertDB["💾 Insert vào Database"]
        ReturnId["🆔 Trả Về Project ID"]
    end

    subgraph "UI Rendering"
        RenderList["📋 Render Danh Sách<br/>Projects"]
        ProjectCard["🎴 Project Card<br/>(name, ownerId)"]
    end

    HomePage --> UseQuery
    HomePage --> CreateBtn

    UseQuery --> ConvexQuery
    ConvexQuery --> CheckIdentity1
    CheckIdentity1 -->|"Không có identity"| ReturnEmpty["📭 Trả Về []"]
    CheckIdentity1 -->|"Có identity"| QueryDB
    QueryDB --> ReturnProjects
    ReturnProjects --> RenderList
    RenderList --> ProjectCard

    CreateBtn --> UseMutation
    UseMutation --> ConvexMutation
    ConvexMutation --> CheckIdentity2
    CheckIdentity2 -->|"Không có identity"| Unauthorized
    CheckIdentity2 -->|"Có identity"| InsertDB
    InsertDB --> ReturnId
    ReturnId --> UseQuery

    style HomePage fill:#e1f5ff
    style InsertDB fill:#d4f1d4
    style Unauthorized fill:#ffe4e4
```

## Cấu Trúc Database Schema

```mermaid
graph LR
    subgraph "Convex Schema"
        ProjectTable["📊 Table: project"]

        subgraph "Fields"
            Name["name: string"]
            OwnerId["ownerId: string"]
            ImportStatus["importStatus?: union<br/>('importing' | 'success' | 'failed')"]
        end

        subgraph "Indexes"
            ByOwner["Index: by_owner<br/>[ownerId]"]
        end
    end

    ProjectTable --> Name
    ProjectTable --> OwnerId
    ProjectTable --> ImportStatus
    ProjectTable --> ByOwner

    style ProjectTable fill:#d4f1d4
    style ByOwner fill:#fff4cc
```

## Cấu Trúc Providers & Context

```mermaid
graph TB
    RootLayout["🏗️ Root Layout"]

    subgraph "Providers Hierarchy"
        ClerkProvider["🔐 ClerkProvider<br/>(Authentication)"]
        ConvexProvider["🔄 ConvexProviderWithClerk<br/>(State Management)"]
        ThemeProvider["🎨 ThemeProvider<br/>(Dark Mode Support)"]

        subgraph "Conditional Rendering"
            Authenticated["✅ Authenticated"]
            Unauthenticated["❌ Unauthenticated"]
            AuthLoading["⏳ AuthLoading"]
        end
    end

    RootLayout --> ClerkProvider
    ClerkProvider --> ConvexProvider
    ConvexProvider --> ThemeProvider

    ThemeProvider --> Authenticated
    ThemeProvider --> Unauthenticated
    ThemeProvider --> AuthLoading

    Authenticated --> UserButton["👤 UserButton"]
    Authenticated --> Children["📄 Children Content"]

    Unauthenticated --> UnanthView["🚫 unauthenticatedView"]
    AuthLoading --> LoadingView["⏳ AuthLoadingView"]

    style ClerkProvider fill:#ffd6e8
    style ConvexProvider fill:#e1f5ff
    style ThemeProvider fill:#f0e6ff
```

## Component Architecture

```mermaid
graph TB
    subgraph "📱 Application Layer"
        App["app/layout.tsx<br/>(Root Layout)"]
        Home["app/page.tsx<br/>(Home Page)"]
    end

    subgraph "🔧 Core Components"
        Providers["components/providers.tsx"]
        ThemeProvider["components/theme-provider.tsx"]
        ModeToggle["components/mode-toggle.tsx"]
    end

    subgraph "🎨 UI Components Library"
        Button["ui/button.tsx"]
        Card["ui/card.tsx"]
        Dialog["ui/dialog.tsx"]
        Form["ui/form.tsx"]
        Input["ui/input.tsx"]
        Spinner["ui/spinner.tsx"]
        Item["ui/item.tsx"]
        Others["... 50+ components"]
    end

    subgraph "🔐 Auth Feature"
        AuthLoading["auth/components/<br/>auth-loading-view.tsx"]
        Unauth["auth/components/<br/>unauthenticated-view.tsx"]
    end

    App --> Providers
    App --> Home

    Providers --> ThemeProvider
    Providers --> AuthLoading
    Providers --> Unauth

    Home --> Button
    Home --> Card

    AuthLoading --> Spinner
    Unauth --> Item
    Unauth --> Button

    style App fill:#e1f5ff
    style Providers fill:#f0e6ff
    style AuthLoading fill:#ffe4e4
```

## Security & Authorization Flow

```mermaid
flowchart TD
    Request["📨 Client Request"]

    subgraph "Client Side"
        ClerkSDK["🔐 Clerk SDK"]
        GetToken["🎫 Get JWT Token"]
    end

    subgraph "Network"
        HTTPRequest["🌐 HTTP Request<br/>with Authorization Header"]
    end

    subgraph "Convex Backend"
        AuthMiddleware["🛡️ Auth Middleware"]
        ValidateJWT{"✓ Validate JWT"}
        ExtractIdentity["👤 Extract User Identity"]

        subgraph "Handler Execution"
            CheckAuth{"🔍 Check<br/>ctx.auth.getUserIdentity()"}
            Authorized["✅ Authorized"]
            Unauthorized["❌ Unauthorized"]
        end

        ExecuteLogic["⚙️ Execute Business Logic"]
        Response["📤 Return Response"]
    end

    Request --> ClerkSDK
    ClerkSDK --> GetToken
    GetToken --> HTTPRequest

    HTTPRequest --> AuthMiddleware
    AuthMiddleware --> ValidateJWT

    ValidateJWT -->|"Valid"| ExtractIdentity
    ValidateJWT -->|"Invalid"| Unauthorized

    ExtractIdentity --> CheckAuth
    CheckAuth -->|"Identity exists"| Authorized
    CheckAuth -->|"No identity"| Unauthorized

    Authorized --> ExecuteLogic
    ExecuteLogic --> Response

    Unauthorized --> Response

    style Authorized fill:#d4f1d4
    style Unauthorized fill:#ffe4e4
    style ValidateJWT fill:#fff4cc
```

## Tổng Kết Luồng Business Logic

### 🎯 Các Luồng Chính

1. **Authentication Flow**: Clerk → JWT → Convex Auth Config
2. **Data Fetching Flow**: useQuery → Convex Query → Database
3. **Data Mutation Flow**: useMutation → Convex Mutation → Database
4. **Authorization Flow**: JWT Validation → Identity Check → Access Control

### 🔑 Điểm Quan Trọng

- **Real-time Sync**: Convex tự động đồng bộ dữ liệu giữa client và server
- **Type Safety**: TypeScript end-to-end từ frontend đến backend
- **Security**: Mọi request đều được xác thực qua JWT token
- **Scalability**: Serverless architecture với Convex
- **Developer Experience**: Type-safe API, auto-generated types

### 📊 Database Design

- **Single Table**: `project` table với index `by_owner`
- **Owner-based Access**: Mỗi user chỉ thấy projects của mình
- **Import Status**: Tracking trạng thái import dữ liệu

### 🎨 UI/UX Features

- **Dark Mode**: Theme provider với system preference
- **Loading States**: Dedicated loading views
- **Error Handling**: Unauthorized access handling
- **Responsive Design**: Tailwind CSS utilities
