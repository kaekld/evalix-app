# Evalix Web - Figma Integration Rules (CLAUDE.md)

This document provides comprehensive guidelines for integrating Figma designs into the Evalix codebase using the Model Context Protocol (MCP). It covers design system structure, component architecture, styling patterns, and project organization.

---

## 1. Token Definitions

### Location
Design tokens are defined in **CSS custom properties** within `app/globals.css` and extended via **Tailwind CSS v4** configuration using the `@theme inline` directive.

### Format/Structure

```css
/* app/globals.css */
@import "tailwindcss";

:root {
  --background: #f6f6fa;
  --foreground: #232334;
  --color-primary: #6543ab;
  --color-primary-light: #f0eafb;
  --color-text-primary: #232334;
  --color-text-secondary: #747487;
  --color-border: #dedee8;
  --color-card-bg: #ffffff;
  --color-exam-card-bg: #e4f7fb;
  --color-exam-btn-bg: #44689e;
  --color-group-accent: #95c9a4;
  --color-user-btn-bg: #f6f6fa;
  --color-nav-active: #f0eafb;
  --color-divider: #dedee8;
}

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-primary: var(--color-primary);
  --color-primary-light: var(--color-primary-light);
  --color-text-primary: var(--color-text-primary);
  --color-text-secondary: var(--color-text-secondary);
  --color-border: var(--color-border);
  --color-card-bg: var(--color-card-bg);
  --color-exam-card-bg: var(--color-exam-card-bg);
  --color-exam-btn-bg: var(--color-exam-btn-bg);
  --color-group-accent: var(--color-group-accent);
  --color-user-btn-bg: var(--color-user-btn-bg);
  --color-nav-active: var(--color-nav-active);
  --color-divider: var(--color-divider);
  --font-sans: var(--font-inter);
  --font-mono: var(--font-geist-mono);
}

@media (prefers-color-scheme: dark) {
  :root {
    --background: #0a0a0a;
    --foreground: #ededed;
  }
}

body {
  background: var(--background);
  color: var(--foreground);
  font-family: var(--font-sans), Arial, Helvetica, sans-serif;
}

@keyframes fade-in {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.animate-fade-in {
  animation: fade-in 0.45s ease-out;
}
```

### Color Palette (Tailwind v4 + Custom CSS Variables)

| Category | Tokens | Usage |
|----------|--------|-------|
| **Background** | `--background` (`#f6f6fa`), `--foreground` (`#232334`) | Page base colors |
| **Primary Brand** | `--color-primary` (`#6543AB`), `--color-primary-light` (`#f0eafb`) | Primary buttons, active states, links |
| **Semantic Text** | `--color-text-primary` (`#232334`), `--color-text-secondary` (`#747487`) | Headings, body text, muted text |
| **UI Elements** | `--color-border` (`#dedee8`), `--color-divider` (`#dedee8`) | Borders, dividers |
| **Cards** | `--color-card-bg` (`#ffffff`) | Card backgrounds |
| **Student/Exam** | `--color-exam-card-bg` (`#e4f7fb`), `--color-exam-btn-bg` (`#44689e`) | Exam cards, exam CTA buttons |
| **Groups** | `--color-group-accent` (`#95c9a4`) | Group sidebar accent bar |
| **Navigation** | `--color-nav-active` (`#f0eafb`), `--color-user-btn-bg` (`#f6f6fa`) | Active nav tabs, user menu button |
| **Role Accents** | Admin: `orange-600`/`orange-100`, Teacher: `purple-600`/`purple-100`, Student: `blue-600`/`blue-100` | Role-specific theming |

### Spacing & Typography
- **Spacing**: Tailwind default scale (4px base unit)
- **Typography**: 
  - Sans: **Inter** (`--font-inter`) — loaded via `next/font/google` with weights 400/500/600/700
  - Mono: **Geist Mono** (`--font-geist-mono`)
  - Base sizes: `text-xs` through `text-6xl` with responsive modifiers

### Token Transformation
- **Tailwind v4** uses CSS-first configuration via `@theme inline`
- No separate token files (e.g., no `tokens.json` or Style Dictionary)
- CSS custom properties act as the single source of truth
- Dark mode handled via `prefers-color-scheme` media query on `:root` (minimal — only background/foreground)
- Custom colors accessed via arbitrary values: `bg-[#6543AB]`, `text-[#232334]`, etc.

---

## 2. Component Library

### Location
Components are organized by feature/route under `app/**/components/`:

```
app/
├── login/
│   └── components/
│       ├── LoginForm.tsx
│       ├── Carousel.tsx
│       ├── RoleSelector.tsx
│       └── RegisterModal.tsx
├── administrador/
│   └── page.tsx (inline components)
├── docente/
│   └── page.tsx (inline components)
└── alumno/
    └── inicio/page.tsx (complex inline components with state)
```

### Architecture Patterns

#### 1. **Client Components** (`"use client"`)
All interactive components use the `"use client"` directive:

```tsx
// app/login/components/LoginForm.tsx
"use client";

import { useState } from "react";
import RoleSelector from "./RoleSelector";
import RegisterModal from "./RegisterModal";

export default function LoginForm() {
  // Component logic
}
```

#### 2. **Compound Components**
Forms compose smaller components:
- `LoginForm` → `RoleSelector` + `RegisterModal`
- `RegisterModal` manages its own state independently

#### 3. **TypeScript Interfaces**
Props are typed with explicit interfaces:

```tsx
// app/login/components/RoleSelector.tsx
export type Role = "alumno" | "docente";

type RoleSelectorProps = {
  role: Role;
  onChange: (role: Role) => void;
};
```

#### 4. **Inline SVG Icons** (Primary Icon System)
Icons are inlined as SVG elements (not imported as components):

```tsx
<svg 
  viewBox="0 0 24 24" 
  fill="none" 
  stroke="currentColor" 
  strokeWidth={2} 
  strokeLinecap="round" 
  strokeLinejoin="round" 
  className="w-5 h-5" 
  aria-hidden="true"
>
  <path d="M15 18l-6-6 6-6" />
</svg>
```

**Conventions:**
- `stroke="currentColor"` — inherits text color
- `strokeWidth="2"` or `"3"` — consistent weight
- `strokeLinecap="round"` + `strokeLinejoin="round"` — rounded caps
- `className="h-4 w-4"` or `h-5 w-5` — consistent sizing
- `aria-hidden="true"` — decorative icons hidden from screen readers

#### 5. **Lucide React** (Secondary/Complex Icons)
Used in `alumno/inicio/page.tsx` for semantic UI icons:

```tsx
import { Menu, X, User, ChevronDown, Clock, BookOpen, HelpCircle, CheckCircle, MoreVertical } from "lucide-react";

<User className="w-5 h-5 text-zinc-500" />
<Clock className="w-4 h-4" />
<CheckCircle className="w-5 h-5" />
```

### No Storybook / Documentation
- No Storybook configuration found
- No separate component documentation
- Components documented via TypeScript props and inline comments

---

## 3. Frameworks & Libraries

### Core Stack

| Category | Technology | Version |
|----------|------------|---------|
| **Framework** | Next.js (App Router) | 16.4.5 |
| **React** | React | 19.3.0 |
| **Language** | TypeScript | ^5 |
| **Styling** | Tailwind CSS v4 | ^4 |
| **Font Loading** | `next/font/google` | Built-in |
| **Icons** | Lucide React | ^1.74.0 |
| **Build Tool** | Turbopack | Built into Next.js 15+ |
| **Linting** | ESLint 9 + `eslint-config-next` | ^9 / 16.4.5 |

### Next.js Configuration

```typescript
// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    agentFeedback: true,
  },
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
```

### TypeScript Configuration

```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "strict": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

### Path Aliases
- `@/*` maps to `./*` (project root)

---

## 4. Asset Management

### Storage
- **Public assets**: `public/` directory
  - SVGs: `vercel.svg`, `window.svg`, `globe.svg`, `next.svg`, `file.svg`, `book.svg`, `logo.png`
  - Carousel images: `carrousel1.jpg`, `carrousel2.jpg`, `carrousel3.jpg`
- **Build output**: `out/` (static export) — contains optimized assets

### Referencing Assets
```tsx
// In components, assets referenced via public URLs
<img src="/carrousel1.jpg" alt="..." />
<img src="/logo.png" alt="..." />
```

### Optimization
- **Next.js Image Optimization**: Not explicitly configured (uses static export via `out/`)
- **Turbopack**: CSS processing via `@tailwindcss/turbopack`
- **Fonts**: Optimized via `next/font/google` (self-hosted, preloaded)
- **Static Export**: `output: 'export'` implied by `out/` directory structure

### CDN
- No explicit CDN configuration
- Vercel deployment assumed (default for Next.js)

---

## 5. Icon System

### Two-Tier Approach

#### 1. **Inline SVG** (Primary — Simple/UI Icons)
Used throughout login components and dashboards for simple directional/utility icons:

```tsx
// app/login/components/Carousel.tsx
<svg 
  viewBox="0 0 24 24" 
  fill="none" 
  stroke="currentColor" 
  strokeWidth="3" 
  strokeLinecap="round" 
  strokeLinejoin="round" 
  className="h-4 w-4" 
  aria-hidden="true"
>
  <path d="m15 18-6-6 6-6" />
</svg>
```

**Conventions:**
- `stroke="currentColor"` — inherits text color
- `strokeWidth="2"` or `"3"` — consistent weight
- `strokeLinecap="round"` + `strokeLinejoin="round"` — rounded caps
- `className="h-4 w-4"` or `h-5 w-5` — consistent sizing
- `aria-hidden="true"` — decorative icons hidden from screen readers

#### 2. **Lucide React** (Secondary — Complex/Feature Icons)
Used in `alumno/inicio/page.tsx` for semantic UI icons:

```tsx
import { Menu, X, User, ChevronDown, Clock, BookOpen, HelpCircle, CheckCircle, MoreVertical } from "lucide-react";

<User className="w-5 h-5 text-zinc-500" />
<Clock className="w-4 h-4" />
<CheckCircle className="w-5 h-5" />
```

### Naming Convention
- **Inline**: Descriptive path data (no naming system)
- **Lucide**: PascalCase component names matching Lucide library

---

## 6. Styling Approach

### Methodology: **Utility-First CSS (Tailwind CSS v4)**

#### Global Styles
Only `app/globals.css` exists — contains:
- Tailwind import
- CSS custom properties for colors/fonts
- Dark mode media query (minimal)
- One custom animation: `.animate-fade-in`

```css
@keyframes fade-in {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.animate-fade-in {
  animation: fade-in 0.45s ease-out;
}
```

#### Component Styling Patterns

##### 1. **Responsive Layout**
```tsx
// Login page: side-by-side on desktop, stacked on mobile
<main className="flex min-h-screen flex-1 bg-zinc-50">
  <Carousel /> {/* hidden on mobile: lg:block */}
  <LoginForm /> {/* full width on mobile, 60% on lg: lg:w-[60%] */}
</main>
```

##### 2. **Interactive States** (Consistent Pattern)
```tsx
className="
  h-12 w-full rounded-lg border border-zinc-200 bg-white px-4 text-base
  outline-none transition
  placeholder:text-zinc-400
  focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10
"
```

##### 3. **Error States** (Conditional Classes)
```tsx
className={`
  h-11 w-full rounded-lg border bg-white px-4 text-base
  outline-none transition placeholder:text-zinc-400
  ${errors.field
    ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/10"
    : "border-zinc-200 focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10"
  }
`}
```

##### 4. **Role-Based Theming**
Each role has a distinct accent color applied consistently:
- **Admin**: `orange-600` / `orange-100` / `orange-50`
- **Teacher**: `purple-600` / `purple-100` / `purple-50`
- **Student**: `blue-600` / `blue-100` / `blue-50` (plus custom CSS vars)

```tsx
// Admin panel card
<a href="..." className="group p-6 bg-white rounded-xl border border-zinc-200 hover:border-orange-300 hover:shadow-lg transition-all">
  <div className="w-12 h-12 rounded-lg bg-orange-100 group-hover:bg-orange-600 transition-colors">
    <svg className="w-6 h-6 text-orange-600 group-hover:text-white transition-colors" />
  </div>
</a>
```

##### 5. **Responsive Breakpoints**
- Mobile-first: base classes apply to all, `lg:` for ≥1024px, `xl:` for ≥1280px
- Common pattern: `hidden lg:block` for desktop-only sections
- Grid: `grid md:grid-cols-3` or `lg:grid-cols-12` for complex layouts
- Student dashboard: fixed 88px header, 256px sidebar (`w-64`), fluid main area

##### 6. **Custom Color Usage**
Custom CSS variables used via arbitrary values:
```tsx
bg-[#6543AB] text-[#232334] border-[#dedee8] bg-[#f0eafb] text-[#6543ab]
```

### No CSS Modules / Styled Components
- Pure Tailwind utility classes
- No `.module.css` files
- No CSS-in-JS libraries

---

## 7. Project Structure

### Overall Organization
```
evalix-web/
├── app/                          # Next.js App Router
│   ├── globals.css              # Global styles + tokens (CSS vars + @theme)
│   ├── layout.tsx               # Root layout + font loading (Inter + Geist Mono)
│   ├── page.tsx                 # Redirects to /login
│   ├── login/                   # Auth feature
│   │   ├── page.tsx             # Composes Carousel + LoginForm
│   │   └── components/          # Feature-scoped components
│   ├── administrador/           # Admin role feature
│   │   └── page.tsx             # Dashboard with role-themed cards
│   ├── docente/                 # Teacher role feature
│   │   └── page.tsx             # Dashboard with role-themed cards
│   └── alumno/                  # Student role feature
│       ├── page.tsx             # Redirects to /inicio
│       └── inicio/
│           └── page.tsx         # Complex client component with state
├── public/                      # Static assets (images, SVGs)
├── out/                         # Static export output
├── next.config.ts               # Next.js + Turbopack config
├── tsconfig.json                # TypeScript config (paths: @/* -> ./*)
├── eslint.config.mjs            # ESLint config (next/core-web-vitals + next/typescript)
├── package.json
├── pnpm-lock.yaml
└── README.md
```

### Feature Organization Patterns

#### 1. **Route-Based Grouping**
Each role has its own route segment with colocated components:
```
/login          → Public authentication
/administrador  → Admin dashboard
/docente        → Teacher dashboard
/alumno         → Student dashboard (with /inicio sub-route)
```

#### 2. **Component Colocation**
Components live next to their parent route:
```
app/login/components/     # Login-specific components
app/alumno/inicio/        # Student homepage (inline in page.tsx)
```

#### 3. **Shared Components** (Not Yet Implemented)
- No `components/ui/` or `components/shared/` directory exists
- Components are feature-scoped; reuse via copy or future extraction

#### 4. **Data & Types**
- Types defined inline with components (e.g., `Role` in `RoleSelector.tsx`, `Exam`/`Group` in `alumno/inicio/page.tsx`)
- Mock data as `const` arrays within component files
- No separate `lib/`, `types/`, or `data/` directories yet

---

## Figma Integration Guidelines

### Design-to-Code Workflow

#### 1. **Token Mapping**
When importing Figma designs, map tokens to existing system:

| Figma Token | Code Equivalent |
|-------------|-----------------|
| Primary Purple | `#6543AB` / `bg-[#6543AB]` |
| Primary Light | `#f0eafb` / `bg-[#f0eafb]` |
| Text Primary | `#232334` / `text-[#232334]` |
| Text Secondary | `#747487` / `text-[#747487]` |
| Border/Divider | `#dedee8` / `border-[#dedee8]` |
| Background | `#f6f6fa` / `bg-[#f6f6fa]` |
| Card Background | `#ffffff` / `bg-white` |
| Exam Card BG | `#e4f7fb` / `bg-[#e4f7fb]` |
| Exam Button BG | `#44689e` / `bg-[#44689e]` |
| Group Accent | `#95c9a4` / `bg-[#95c9a4]` |
| Admin Orange | `orange-600` / `orange-100` |
| Teacher Purple | `purple-600` / `purple-100` |
| Student Blue | `blue-600` / `blue-100` |
| Font Sans | `font-sans` (Inter) |
| Font Mono | `font-mono` (Geist Mono) |
| Spacing | Tailwind scale (4px base) |
| Border Radius | `rounded-lg` (0.5rem), `rounded-xl` (0.75rem), `rounded-2xl` (1rem) |
| Header Height | `h-22` (88px) |
| Sidebar Width | `w-64` (256px) |

#### 2. **Component Creation**
- Create new components in `app/<feature>/components/`
- Use `"use client"` for interactive components
- Follow existing TypeScript prop patterns (`<ComponentName>Props` suffix)
- Use inline SVG for simple icons; Lucide for complex ones
- Export types with `export type` for external consumption

#### 3. **Styling New Components**
- Use Tailwind utility classes exclusively
- Follow responsive patterns: mobile-first, `lg:`/`xl:` breakpoints
- Match interactive states: `focus:ring-2 focus:ring-zinc-900/10`
- Use role-based theming for role-specific features
- Use arbitrary values for custom colors: `bg-[#6543AB]`
- Apply consistent transitions: `transition`, `transition-colors`, `transition-all`

#### 4. **Asset Handling**
- Place new images in `public/`
- Reference via `/filename.ext`
- SVGs: prefer inline for icons, `public/` for illustrations

#### 5. **Dark Mode**
- Current: only supports `prefers-color-scheme` (minimal — only bg/fg)
- New components: use `dark:` variant if dark mode expanded
- Current dark tokens: `--background: #0a0a0a`, `--foreground: #ededed`

### Code-to-Design Sync (MCP)

When pushing code changes to Figma via MCP:

1. **Run `search_design_system` first** to find existing Figma components/tokens
2. **Reuse design system primitives** — don't create duplicates
3. **Map components via Code Connect** using `add_code_connect_map`
4. **Use `generate_figma_design`** for pixel-perfect screenshots
5. **Use `use_figma`** to build/update screens from design system components

---

## Key Conventions Summary

| Aspect | Convention |
|--------|------------|
| **Component Files** | PascalCase (`.tsx`) |
| **Component Exports** | `export default` |
| **Props Interface** | `<ComponentName>Props` suffix |
| **Type Exports** | Named exports for reusable types (`export type Role`) |
| **State Hooks** | `useState`, `useEffect` at top of component |
| **Event Handlers** | `handle<Action>`, `on<Action>` props |
| **Conditional Classes** | Template literals with ternary operators |
| **Responsive** | Mobile-first, `lg:`/`xl:` prefixes |
| **Icons** | Inline SVG (primary) / Lucide (secondary) |
| **Colors** | Tailwind palette + custom CSS vars via arbitrary values |
| **Fonts** | `font-sans` (Inter) / `font-mono` (Geist Mono) |
| **Animations** | `.animate-fade-in` only (custom) |
| **Form Inputs** | `h-11` or `h-12`, `rounded-lg`, consistent focus rings |
| **Buttons Primary** | `bg-[#6543AB]` / `hover:bg-zinc-800`, `h-11`/`h-12`, `rounded-lg` |
| **Cards** | `bg-white rounded-xl border border-zinc-200` + hover variants |
| **Role Cards** | `group` + `group-hover:` for coordinated transitions |

---

## MCP Server Usage

### Required Skills (Load Before Operations)

```bash
# Design-to-Code (Figma → Code)
/figma-design-to-code

# Code-to-Design (Code → Figma)
/figma-generate-design
/figma-use

# Design System Sync
/figma-generate-library
/figma-code-connect
```

### Workflow Commands

```typescript
// 1. Create session for target Figma file
await tools.figma.create_session({ fileKey, taskDescription });

// 2. Search existing design system
await tools.figma.search_design_system({ query: "button", fileKey });

// 3. Get design context for implementation
await tools.figma.get_design_context({ nodeId, fileKey });

// 4. Push code changes to Figma
await tools.figma.use_figma({ fileKey, sessionId, ... });

// 5. Map components (Code Connect)
await tools.figma.add_code_connect_map({ nodeId, fileKey, source, componentName, label });
```

---

*Generated from codebase analysis on 2026-11-19. Update when design system evolves.*