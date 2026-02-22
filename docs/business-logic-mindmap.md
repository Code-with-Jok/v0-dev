# Business Logic Mindmap - V0 Dev Project

> [!NOTE]
> Tài liệu này mô tả luồng logic nghiệp vụ (business logic flow) của dự án V0 Dev.

## Tổng Quan Kiến Trúc Hệ Thống

```mermaid
graph TB
    User["👤 User"]

    subgraph "Frontend - Next.js 16"
        UI["🎨 UI Components"]
        Pages["📄 Pages"]
    end

    subgraph "Auth - Clerk"
        Clerk["🔐 Clerk"]
        AuthViews["👁️ Auth Views"]
    end

    subgraph "State - Convex"
        ConvexClient["🔄 Convex Client"]
        Hooks["🪝 useQuery/useMutation"]
    end

    subgraph "Backend - Convex"
        AuthConfig["🛡️ Auth Config"]
        Mutations["✏️ Mutations"]
        Queries["🔍 Queries"]
        ConvexDB["💾 Database"]
    end

    subgraph "Background Jobs - Inngest"
        InngestClient["🔄 Inngest"]
        Functions["⚡ Functions"]
    end

    subgraph "Web Scraping - Firecrawl"
        Firecrawl["🌐 Firecrawl API"]
        URLExtract["🔗 URL Extraction"]
    end

    subgraph "AI - Vercel AI SDK"
        AISDK["🤖 AI SDK"]
        Gemini["✨ Gemini"]
        AITelemetry["📊 AI Telemetry"]
    end

    subgraph "AI Suggestion - Code Completion"
        SuggestionAPI["💡 Suggestion API"]
        SuggestionExt["✨ CodeMirror Extension"]
    end

    subgraph "Error Monitoring - Sentry"
        SentryClient["🐛 Sentry Client"]
        SentryServer["🐛 Sentry Server"]
        SentryInngest["🐛 Sentry Middleware"]
        SentryAI["🐛 Vercel AI Integration"]
    end

    User --> UI --> Pages
    Pages --> Clerk --> AuthViews
    Pages --> ConvexClient --> Hooks
    Hooks --> Mutations & Queries
    Clerk --> AuthConfig --> Mutations & Queries
    Mutations & Queries --> ConvexDB

    Pages --> InngestClient --> Functions
    Functions --> URLExtract --> Firecrawl
    Firecrawl --> AISDK --> Gemini
    AISDK --> AITelemetry

    SuggestionExt -->|"POST /api/suggestion"| SuggestionAPI
    SuggestionAPI --> Gemini

    Pages --> SentryClient
    Mutations & Queries --> SentryServer
    Functions --> SentryInngest
    AITelemetry --> SentryAI
    SentryClient & SentryServer & SentryInngest & SentryAI --> SentryDashboard["📊 Sentry Dashboard"]

    style User fill:#e1f5ff
    style Clerk fill:#ffd6e8
    style ConvexDB fill:#d4f1d4
    style InngestClient fill:#fff4cc
    style Firecrawl fill:#ffe8cc
    style AISDK fill:#e8f4ff
    style SentryDashboard fill:#ffe4e4
```

## Luồng Authentication

```mermaid
flowchart TD
    Start["🚀 App Start"]
    CheckAuth{"🔍 Check Auth"}

    Loading["⏳ AuthLoading"]
    ShowLoading["📺 AuthLoadingView"]

    Authenticated["✅ Authenticated"]
    ShowContent["📄 Show Content"]

    Unauthenticated["❌ Unauthenticated"]
    ShowUnauth["🚫 UnauthenticatedView"]

    ClerkAuth["🔐 Clerk Auth"]
    GetJWT["🎫 Get JWT"]

    Start --> CheckAuth
    CheckAuth -->|Loading| Loading --> ShowLoading
    CheckAuth -->|Authenticated| Authenticated --> ShowContent
    CheckAuth -->|Unauthenticated| Unauthenticated --> ShowUnauth
    ShowUnauth --> ClerkAuth --> GetJWT --> Authenticated

    style Authenticated fill:#d4f1d4
    style Unauthenticated fill:#ffe4e4
```

## Luồng Quản Lý Project

```mermaid
flowchart TD
    HomePage["🏠 Home Page (ProjectView)"]

    UseQuery["🔍 useQuery(api.projects.get)"]
    CheckAuth1{"🔐 Check Identity"}
    QueryDB["💾 Query projects by ownerId"]
    RenderList["📋 Render ProjectsList"]

    CreateBtn["➕ Create Button (Ctrl+J)"]
    UseMutation["✏️ useMutation(api.projects.create)"]
    CheckAuth2{"🔐 Check Identity"}
    InsertDB["💾 Insert to 'projects' table"]

    HomePage --> UseQuery
    UseQuery --> CheckAuth1
    CheckAuth1 -->|No identity| ReturnEmpty["📭 Return []"]
    CheckAuth1 -->|Has identity| QueryDB --> RenderList

    HomePage --> CreateBtn --> UseMutation
    UseMutation --> CheckAuth2
    CheckAuth2 -->|No identity| Error["❌ Unauthorized"]
    CheckAuth2 -->|Has identity| InsertDB --> UseQuery

    style InsertDB fill:#d4f1d4
    style Error fill:#ffe4e4
```

## Luồng Chi Tiết Project (Project Detail)

```mermaid
flowchart TD
    DetailPage["📄 Page /projects/:id"]
    GetData["🔍 useQuery(api.projects.getById)"]

    subgraph UI [Layout & Components]
        Navbar["🧭 Navbar"]
        Sidebar["💬 Conversation Sidebar"]
        MainView["🖥️ Editor/Preview Tabs"]
    end

    subgraph Components [Navbar Components]
        Renamer["📝 ProjectTitleRenamer"]
        Status["☁️ ProjectSaveStatus"]
    end

    UserAction["👤 User Rename"]
    Optimistic["⚡ Optimistic Update"]
    ServerMutation["✏️ Mutation(api.projects.rename)"]

    DetailPage --> GetData --> UI

    Navbar --> Renamer & Status
    Renamer --> UserAction
    UserAction --> Optimistic --> Renamer
    Optimistic -.-> ServerMutation

    style Optimistic fill:#fff4cc
    style ServerMutation fill:#ffd6e8
```

## Database Schema

```mermaid
graph LR
    ProjectTable["📊 Table: projects"]

    Fields["Fields:<br/>• name: string<br/>• ownerId: string<br/>• importStatus?: union"]

    Index["Index:<br/>by_owner [ownerId]"]

    ProjectTable --> Fields
    ProjectTable --> Index

    style ProjectTable fill:#d4f1d4
    style Index fill:#fff4cc
```

## Providers Hierarchy

```mermaid
graph TB
    RootLayout["🏗️ Root Layout"]

    ClerkProvider["🔐 ClerkProvider"]
    ConvexProvider["🔄 ConvexProviderWithClerk"]
    ThemeProvider["🎨 ThemeProvider"]

    Authenticated["✅ Authenticated"]
    Unauthenticated["❌ Unauthenticated"]
    AuthLoading["⏳ AuthLoading"]

    RootLayout --> ClerkProvider --> ConvexProvider --> ThemeProvider
    ThemeProvider --> Authenticated & Unauthenticated & AuthLoading

    style ClerkProvider fill:#ffd6e8
    style ConvexProvider fill:#e1f5ff
```

## Luồng Quản Lý File (File Explorer)

```mermaid
flowchart TD
    UserClick["👤 User Click Folder"]
    Toggle["🔄 Toggle isOpen"]

    CheckData{"💾 Has Data?"}
    Fetch["☁️ useQuery(api.files.getFolderContents)"]
    Render["🌳 Render Children"]

    UserClick --> Toggle
    Toggle -->|True| CheckData
    CheckData -->|No| Fetch
    Fetch --> Render
    CheckData -->|Yes| Render

    subgraph RecursiveUI
        Tree["Tree Component"]
        Dispatcher{"Type?"}
        FileUI["📄 FileNode"]
        FolderUI["📂 FolderNode"]

        Tree --> Dispatcher
        Dispatcher -->|"File"| FileUI
        Dispatcher -->|"Folder"| FolderUI
        FolderUI -.->|"Children"| Tree
    end

    Render --> RecursiveUI

    style Fetch fill:#e1f5ff
    style FolderUI fill:#fff4cc
```

## Luồng Code Editor (Tab & Autosave)

```mermaid
flowchart TD
    subgraph FileExplorer
        Click["👆 Click File"]
        DblClick["👆👆 Double-Click File"]
    end

    subgraph ZustandStore["Zustand Store"]
        OpenFile["openFile(fileId, pinned)"]
        TabState["TabState: openTabs, activeTabId, previewTabId"]
    end

    subgraph EditorUI
        TopNav["TopNavigation (Tabs)"]
        CodeEditor["CodeEditor"]
        Autosave{"Debounce 1.5s"}
    end

    subgraph Backend
        GetFile["useFile(activeTabId)"]
        UpdateFile["updateFile(id, content)"]
    end

    Click -->|"pinned: false"| OpenFile
    DblClick -->|"pinned: true"| OpenFile
    OpenFile --> TabState
    TabState --> TopNav
    TabState --> GetFile
    GetFile --> CodeEditor
    CodeEditor -->|"onChange"| Autosave
    Autosave -->|"Sau 1.5s"| UpdateFile

    style OpenFile fill:#e1f5ff
    style Autosave fill:#fff4cc
    style UpdateFile fill:#d4edda
```

## Luồng AI Suggestion (Gợi Ý Code Tự Động)

```mermaid
flowchart TD
    subgraph Client["🖥️ Browser"]
        Type["⌨️ User gõ code"]
        Debounce["⏱️ Debounce 300ms"]
        Payload["📦 Tạo context payload"]
        Fetch["🌐 Gọi API (ky)"]
        State["💾 Lưu suggestion vào State"]
        Render["👻 Hiển thị ghost text"]
        Accept{"Tab pressed?"}
        Insert["✅ Chèn suggestion"]
    end

    subgraph Server["⚙️ API Route"]
        Validate["🔍 Zod Validate"]
        BuildPrompt["📝 Build Prompt"]
        AICall["🤖 Gemini AI"]
    end

    Type --> Debounce
    Debounce -->|"Ngừng gõ 300ms"| Payload
    Payload --> Fetch
    Fetch -->|"POST /api/suggestion"| Validate
    Validate --> BuildPrompt --> AICall
    AICall -->|"suggestion text"| Fetch
    Fetch --> State --> Render
    Render --> Accept
    Accept -->|"Yes"| Insert
    Accept -->|"No"| Type

    style Debounce fill:#fff4cc
    style AICall fill:#e8f4ff
    style Insert fill:#d4f1d4
    style Render fill:#ffd6e8
```

## Tóm tắt

### 🎯 Các Luồng Chính

1. **Authentication**: Clerk → JWT → Convex Auth
2. **Data Fetching**: useQuery → Convex Query → Database
3. **Data Mutation**: useMutation → Convex Mutation → Database

### 🔑 Tech Stack

- **Frontend**: Next.js 16 + React 19 + TypeScript
- **UI**: Radix UI + Tailwind CSS + shadcn/ui
- **Auth**: Clerk + JWT
- **Database**: Convex (Realtime)
- **Theme**: next-themes

### 📊 Database

- **Table**: `projects` với index `by_owner`
- **Access**: Owner-based (mỗi user chỉ thấy projects của mình)

### ⚡ Features

- ✅ Real-time sync (Convex)
- ✅ Type-safe end-to-end
- ✅ JWT authentication
- ✅ Dark mode support
- ✅ AI Code Suggestion (Gemini + CodeMirror Extension)
