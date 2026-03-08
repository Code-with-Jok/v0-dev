# v0-dev: Next-Gen AI-Powered Development Platform

[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-blue?style=flat-square&logo=react)](https://react.dev/)
[![Convex](https://img.shields.io/badge/Backend-Convex-orange?style=flat-square)](https://convex.dev/)
[![Clerk](https://img.shields.io/badge/Auth-Clerk-purple?style=flat-square)](https://clerk.com/)
[![Tailwind CSS](https://img.shields.io/badge/CSS-Tailwind%204-06B6D4?style=flat-square&logo=tailwindcss)](https://tailwindcss.com/)

---

### 🚀 Overview

**v0-dev** is a high-performance, AI-native development environment inspired by Vercel's v0.dev. It combines a real-time multi-file editor with advanced AI capabilities to help developers build, iterate, and deploy web applications faster than ever.

### ✨ Key Features

- **🤖 Intelligence-First**: Deeply integrated with **Vercel AI SDK** and **Google Gemini** for smart code generation and editing.
- **💻 Real-Time Editor**: A robust multi-file environment powered by **CodeMirror**, featuring syntax highlighting, indentation markers, and minimaps.
- **⚡ Advanced AI Workflows**:
  - **Ghost Text Suggestions**: Real-time code completions as you type.
  - **Quick Edit**: Select code and use AI instructions to refactor or modify instantly.
  - **Web-Aware Context**: Integrated with **Firecrawl** for scraping web documentation/URLs directly into the AI context.
- **🔄 Real-Time Synchronization**: Built on **Convex**, ensuring every file change, message, and project update is synced instantly across devices.
- **🔐 Secure & Scalable**: Enterprise-grade authentication via **Clerk** and background job processing with **Inngest**.
- **📊 Observability**: Full-stack error tracking and performance monitoring with **Sentry**.

### 🛠️ Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router), [React 19](https://react.dev/)
- **State & Backend**: [Convex](https://convex.dev/) (Real-time Database, Server Functions)
- **Authentication**: [Clerk](https://clerk.com/)
- **AI Ecosystem**: [Vercel AI SDK](https://sdk.vercel.ai/), [Google Gemini](https://ai.google.dev/), [Firecrawl](https://firecrawl.dev/)
- **UI/UX**: [Tailwind CSS 4](https://tailwindcss.com/), [Radix UI](https://www.radix-ui.com/), [Motion (Framer)](https://motion.dev/), [Lucide Icons](https://lucide.dev/)
- **Data & Logic**: [Zod](https://zod.dev/), [Inngest](https://www.inngest.com/), [Sentry](https://sentry.io/)

### 📁 Project Structure

```text
v0-dev/
├── convex/             # Backend: Schema, Mutations, Queries (Convex)
├── docs/               # System architecture & documentation
├── public/             # Static assets
└── src/
    ├── app/            # Next.js App Router (Pages & API)
    ├── components/     # Shared UI components (Radix/Shadcn)
    ├── features/       # Feature-based logic
    │   ├── auth/       # Clerk integration
    │   ├── editor/     # CodeMirror, Tabs, Autosave logic
    │   ├── projects/   # Project management
    │   └── conversations/ # AI Chat interface
    ├── hooks/          # Custom React hooks
    ├── lib/            # Utilities (Convex client, AI config)
    └── store/          # Zustand state management
```

### 🚀 Getting Started

1. **Clone & Install**:

   ```bash
   git clone <repo-url>
   cd v0-dev
   npm install
   ```

2. **Environment Setup**:
   Copy `.env.local.example` to `.env.local` and fill in the required keys for Clerk, Convex, Google Gemini, and Firecrawl.

3. **Run Convex**:

   ```bash
   npx convex dev
   ```

4. **Run Next.js**:
   ```bash
   npm run dev
   ```

---
