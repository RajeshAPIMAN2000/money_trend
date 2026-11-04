# Fintech Demo — Indian Fintech Platform (Static React JS)

A complete, fully static fintech startup website built with **React JS + Vite + TailwindCSS + Recharts** and **React Router DOM**. No backend, no APIs — all data is hardcoded in `src/data/`.

## Quick start

```bash
npm install        # or: bun install / pnpm install
npm run dev        # http://localhost:5173
npm run build      # production build to /dist
npm run preview    # preview the prod build
```

## What's inside

- **11 pages** — Home, FD & RD Marketplace, Mutual Funds, Dashboard, News, Goals, Calculators, Support, e-KYC, Profile, Blog + Article
- **6 fully working calculators** — FD, RD, SIP, EMI, Retirement, Tax (Old vs New)
- **Recharts** powering portfolio donut, expense bar, FD rate trend, SIP projection
- **Interactive** modals, tabs, accordion, step indicator, toggles, filters — all via `useState`
- **Brand colors**: Deep Navy `#0F172A`, Royal Blue `#2563EB`, Emerald `#10B981`, Off-White `#F8FAFC`, Charcoal `#1E293B`
- **Fonts**: Bricolage Grotesque (headings) + DM Sans (body)
- **Animations**: fade-in, scale-in, slide-up, hover-lift on cards, scrolling market ticker, sticky backdrop-blur navbar

## File structure

```
src/
  components/
    common/    Navbar.jsx  Footer.jsx  Sidebar.jsx  MarketTicker.jsx
    ui/        Button.jsx  Card.jsx  Badge.jsx  Modal.jsx
               Accordion.jsx  Tabs.jsx  ProgressBar.jsx  StepIndicator.jsx
  pages/       Home.jsx  FDMarketplace.jsx  MutualFunds.jsx  Dashboard.jsx
               News.jsx  Goals.jsx  Calculators.jsx  Support.jsx
               KYC.jsx  Profile.jsx  Blog.jsx  BlogArticle.jsx
  data/        fd-data.js  funds-data.js  news-data.js  blog-data.js
               dashboard-data.js  goals-data.js
  App.jsx      main.jsx   index.css
```

Zero TypeScript. Zero `.tsx` files. Pure React JS + JSX throughout.
