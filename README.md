# Financial Manager

A web application for **managing personal or household expenses**: record transactions, view month-level summaries, category and daily trend charts, and an **insights** panel driven by your data (rule-based analysis on the server—no external AI service required).

It is aimed at **individuals and small teams** who want a clear picture of where money goes and how the current month compares to the previous one.

---

## Tech stack

| Layer | Technology |
|-------|------------|
| **Frontend** | [Next.js](https://nextjs.org/) 15 (App Router), [React](https://react.dev/) 19, [TypeScript](https://www.typescriptlang.org/) |
| **Styling** | [Tailwind CSS](https://tailwindcss.com/) 3 |
| **Charts** | [Chart.js](https://www.chartjs.org/) + [react-chartjs-2](https://react-chartjs-2.js.org/) |
| **Icons** | [Lucide React](https://lucide.dev/) |
| **Backend / API** | Next.js Route Handlers (`src/app/api/...`) |
| **ORM / data** | [Prisma](https://www.prisma.io/) 6 |
| **Database** | [SQLite](https://www.sqlite.org/) (local file via `DATABASE_URL`) |
| **Linting** | ESLint + `eslint-config-next` |

---

## Prerequisites

- **Node.js** `>= 18.18.0` (see `engines` in `package.json`)
- **npm** (ships with Node; this project uses `package-lock.json`)

No Python or additional runtime is required.

---

## Installation (from scratch)

```bash
# 1. Clone the repository
git clone <repository-url> financial-manager
cd financial-manager

# 2. Install dependencies (also runs prisma generate via postinstall)
npm install

# 3. Environment variables (see the section below)
cp .env.example .env

# 4. Create tables in the local database
npm run db:push

# 5. (Optional) Load sample data
npm run db:seed
```

---

## Environment variables

Create a `.env` file at the project root (you can start from `.env.example`).

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | Prisma connection URL for SQLite. By default it points to a file under the `prisma/` directory. |

Example (also reflected in `.env.example`):

```env
# SQLite path is relative to the prisma/ directory (Prisma convention)
DATABASE_URL="file:./dev.db"
```

> **Note:** `.env` is listed in `.gitignore`. Do not commit secrets or local database files to the repository.

---

## Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser. The app hot-reloads when you save changes.

Other useful commands:

```bash
npm run lint          # ESLint
npm run db:studio     # Prisma Studio (browse/edit records)
```

---

## Production build and runtime

```bash
npm run build
npm start
```

- `build` runs `prisma generate` followed by `next build`.
- `start` serves the application with the Next.js production server (default port `3000`).

### Deployment

This repository does not include a `Dockerfile` or CI pipeline. You can deploy it like any **Node** + **Next.js** application:

- **Vercel**, **Railway**, **Render**, and similar: set `DATABASE_URL` and ensure the SQLite file is on persistent storage, or switch to PostgreSQL/MySQL by updating the `provider` in `prisma/schema.prisma` and the connection URL.
- **Self-hosted**: `npm ci`, `npm run build`, then `NODE_ENV=production npm start` (or a process manager such as PM2).

For production use of SQLite, plan for a **persistent volume** or a managed database if you scale out.

---

## Project structure

```
financial-manager/
├── prisma/
│   ├── schema.prisma    # Data model (Expense) and SQLite datasource
│   └── seed.ts          # Sample data for local development
├── public/              # Static assets served by Next.js
├── src/
│   ├── app/             # App Router: layouts, pages, and API routes
│   │   ├── api/         # Expenses, summary, and insights endpoints
│   │   ├── dashboard/   # “Analytics” view (DashboardAnalytics component)
│   │   ├── layout.tsx
│   │   ├── page.tsx     # Home page (main dashboard)
│   │   └── globals.css
│   ├── components/      # UI: forms, lists, charts, insights panel
│   └── lib/             # Utilities (categories, dates, insight logic)
├── .env.example         # Environment variable template
├── next.config.ts
├── package.json
├── tailwind.config.ts
└── tsconfig.json
```

---

## Best practices and notes

- **Database:** `*.db` files are ignored by Git; each environment creates its own after `db:push` or migrations.
- **Insights:** Logic lives in `src/lib/simulated-insights.ts` and the API routes; it does not depend on an external AI provider API key.
- **Categories:** Defined in `src/lib/categories.ts` (e.g. FOOD, TRANSPORT, …); keep values consistent when creating expenses from the UI or seeds.
- **Code quality:** Run `npm run lint` before merging changes.
- The npm package name in `package.json` may differ from the repository name; this documentation refers to the product as **Financial Manager**.

---

## License

This project is marked as private (`"private": true` in `package.json`). Update the license if you open-source the codebase.
