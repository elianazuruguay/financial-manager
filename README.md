# Financial Manager

A web application for **managing personal or household expenses**: record transactions, view month-level summaries, category and daily trend charts, and an **insights** panel driven by your data (rule-based analysis in the browser—no external AI service required).

It is aimed at **individuals and small teams** who want a clear picture of where money goes and how the current month compares to the previous one.

**Data storage:** all expenses are saved in the **browser** using `localStorage` (per device and browser profile). Nothing is sent to a server for persistence.

## Live demo (Vercel)

- **App**: `https://smart-financial-manager-bay.vercel.app`

---

## Tech stack

| Layer | Technology |
|-------|------------|
| **Frontend** | [Next.js](https://nextjs.org/) 15 (App Router), [React](https://react.dev/) 19, [TypeScript](https://www.typescriptlang.org/) |
| **Styling** | [Tailwind CSS](https://tailwindcss.com/) 3 |
| **Charts** | [Chart.js](https://www.chartjs.org/) + [react-chartjs-2](https://react-chartjs-2.js.org/) |
| **Icons** | [Lucide React](https://lucide.dev/) |
| **Persistence** | Browser `localStorage` (`src/lib/expenses-storage.ts`) |
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

# 2. Install dependencies
npm install
```

There is **no database** to configure. Optional: copy `.env.example` to `.env` if you add environment variables later.

---

## Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser. The app hot-reloads when you save changes.

```bash
npm run lint          # ESLint
```

---

## Production build and runtime

```bash
npm run build
npm start
```

- `build` runs `next build`.
- `start` serves the application with the Next.js production server (default port `3000`).

### Deployment

Deploy as a **static-friendly Next.js** app (e.g. **Vercel**): no `DATABASE_URL` or server database is required. Data remains **only in each visitor’s browser** after they use the app.

---

## Project structure

```
financial-manager/
├── public/              # Static assets served by Next.js
├── src/
│   ├── app/             # App Router: layouts and pages
│   │   ├── dashboard/   # “Analytics” view (DashboardAnalytics component)
│   │   ├── layout.tsx
│   │   ├── page.tsx     # Home page (main dashboard)
│   │   └── globals.css
│   ├── components/      # UI: forms, lists, charts, insights panel
│   ├── lib/             # localStorage store, categories, dates, insight logic
│   └── types/           # Shared types (e.g. Expense)
├── .env.example         # Optional env template
├── next.config.ts
├── package.json
├── tailwind.config.ts
└── tsconfig.json
```

---

## Best practices and notes

- **Privacy:** Expenses never leave the device unless you add your own sync or API later.
- **Insights:** Logic lives in `src/lib/simulated-insights.ts`; it does not depend on an external AI provider API key.
- **Categories:** Defined in `src/lib/categories.ts` (e.g. FOOD, TRANSPORT, …); keep values consistent when creating expenses from the UI.
- **Code quality:** Run `npm run lint` before merging changes.
- The npm package name in `package.json` may differ from the repository name; this documentation refers to the product as **Financial Manager**.

---

## License

This project is marked as private (`"private": true` in `package.json`). Update the license if you open-source the codebase.
