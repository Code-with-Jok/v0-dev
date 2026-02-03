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
    HomePage["🏠 Home Page"]

    UseQuery["🔍 useQuery(api.project.get)"]
    CheckAuth1{"🔐 Check Identity"}
    QueryDB["💾 Query by ownerId"]
    RenderList["📋 Render Projects"]

    CreateBtn["➕ Create Button"]
    UseMutation["✏️ useMutation(api.project.create)"]
    CheckAuth2{"🔐 Check Identity"}
    InsertDB["💾 Insert to DB"]

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

## Luồng Background Jobs

```mermaid
flowchart TD
    DemoPage["🖥️ Demo Page"]
    ClickBtn["👆 Click Button"]
    APIRoute["📡 POST /api/demo/background"]
    SendEvent["📨 inngest.send('demo/generated')"]

    InngestReceive["📥 Inngest Receive"]
    TriggerFunction["⚡ Trigger Function"]
    GenerateText["🤖 step.run('generate-text')"]
    CallAI["🧠 AI SDK → Gemini"]
    ReturnResult["📦 Return Result"]

    Dashboard["📊 Dashboard (localhost:8288)"]

    DemoPage --> ClickBtn --> APIRoute
    APIRoute --> SendEvent
    SendEvent --> InngestReceive --> TriggerFunction
    TriggerFunction --> GenerateText --> CallAI --> ReturnResult
    TriggerFunction --> Dashboard

    style SendEvent fill:#fff4cc
    style CallAI fill:#e8f4ff
    style ReturnResult fill:#d4f1d4
```

## Luồng Web Scraping với Firecrawl

```mermaid
flowchart TD
    Start["🚀 Event: 'demo/generated'<br/>data: { prompt }"]

    subgraph "Step 1: Extract URLs"
        ExtractURLs["🔗 extract-urls"]
        Regex["📝 URL_REGEX.match()"]
        URLArray["📦 Array of URLs"]
    end

    subgraph "Step 2: Scrape Content"
        ScrapeStep["🌐 scrape-urls"]
        ParallelScrape["⚡ Promise.all()"]
        FirecrawlAPI["🔥 firecrawl.scrape()"]
        GetMarkdown["📄 result.markdown"]
        FilterJoin["🔀 Filter & Join"]
    end

    subgraph "Step 3: Build Context"
        CheckContent{"📊 Has Content?"}
        BuildContext["📝 Build Context Prompt"]
        UseOriginal["📝 Use Original Prompt"]
    end

    subgraph "Step 4: AI Generation"
        GenerateAI["🤖 generate-text"]
        CallGemini["✨ Gemini API"]
        ReturnResponse["📦 AI Response"]
    end

    Start --> ExtractURLs --> Regex --> URLArray
    URLArray --> ScrapeStep --> ParallelScrape
    ParallelScrape --> FirecrawlAPI --> GetMarkdown
    GetMarkdown --> FilterJoin

    FilterJoin --> CheckContent
    CheckContent -->|"Has scraped content"| BuildContext
    CheckContent -->|"No URLs found"| UseOriginal

    BuildContext --> GenerateAI
    UseOriginal --> GenerateAI
    GenerateAI --> CallGemini --> ReturnResponse

    style FirecrawlAPI fill:#ffe8cc
    style CallGemini fill:#e8f4ff
    style ReturnResponse fill:#d4f1d4
```

## Luồng Error Monitoring với Sentry

```mermaid
flowchart TD
    subgraph "Error Sources"
        ClientError["🖥️ Client Error<br/>(Browser)"]
        ServerError["⚙️ Server Error<br/>(API Routes)"]
        InngestError["⚡ Inngest Error<br/>(Background Jobs)"]
    end

    subgraph "Sentry Capture"
        SentryClient["🐛 Sentry Client<br/>(Browser SDK)"]
        SentryServer["🐛 Sentry Server<br/>(Node SDK)"]
        SentryMiddleware["🐛 Sentry Middleware<br/>(@inngest/middleware-sentry)"]
    end

    subgraph "Error Processing"
        CaptureError["📦 Capture Error"]
        AddContext["👤 Add User Context"]
        AddBreadcrumbs["🍞 Add Breadcrumbs"]
        SendToSentry["📤 Send to Sentry"]
    end

    subgraph "Sentry Dashboard"
        Dashboard["📊 Sentry Dashboard"]
        ErrorList["📋 Error List"]
        StackTrace["🔍 Stack Trace"]
        UserInfo["👤 User Info"]
        Alerts["🔔 Alerts"]
    end

    ClientError --> SentryClient
    ServerError --> SentryServer
    InngestError --> SentryMiddleware

    SentryClient & SentryServer & SentryMiddleware --> CaptureError
    CaptureError --> AddContext
    AddContext --> AddBreadcrumbs
    AddBreadcrumbs --> SendToSentry

    SendToSentry --> Dashboard
    Dashboard --> ErrorList
    Dashboard --> StackTrace
    Dashboard --> UserInfo
    Dashboard --> Alerts

    style ClientError fill:#ffe4e4
    style ServerError fill:#ffe4e4
    style InngestError fill:#ffe4e4
    style Dashboard fill:#d4f1d4
```

## Database Schema

```mermaid
graph LR
    ProjectTable["📊 Table: project"]

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

## Tóm tắt

### 🎯 Các Luồng Chính

1. **Authentication**: Clerk → JWT → Convex Auth
2. **Data Fetching**: useQuery → Convex Query → Database
3. **Data Mutation**: useMutation → Convex Mutation → Database
4. **Background Jobs**: Event → Inngest → AI SDK → Result

### 🔑 Tech Stack

- **Frontend**: Next.js 16 + React 19 + TypeScript
- **UI**: Radix UI + Tailwind CSS + shadcn/ui
- **Auth**: Clerk + JWT
- **Database**: Convex (Realtime)
- **Background Jobs**: Inngest
- **Web Scraping**: Firecrawl
- **AI**: Vercel AI SDK + Google Gemini
- **Error Monitoring**: Sentry
- **Theme**: next-themes

### 📊 Database

- **Table**: `project` với index `by_owner`
- **Access**: Owner-based (mỗi user chỉ thấy projects của mình)

### ⚡ Features

- ✅ Real-time sync (Convex)
- ✅ Type-safe end-to-end
- ✅ JWT authentication
- ✅ Background processing (Inngest)
- ✅ Web scraping (Firecrawl)
- ✅ AI integration (Gemini)
- ✅ Context-aware AI responses
- ✅ Error monitoring (Sentry)
- ✅ Dark mode support
