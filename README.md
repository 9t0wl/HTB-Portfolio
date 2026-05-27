# 9t0wl Portfolio

Offensive security portfolio — built with React + Vite, deployed to GitHub Pages.

## Setup

```bash
npm install
npm run dev       # dev server at localhost:5173
npm run build     # production build → dist/
```

## Deploying

Push to `main` — GitHub Actions auto-builds and deploys.

**One-time setup (new repo):**
1. Go to repo Settings → Pages → Source: **GitHub Actions**
2. That's it. Push and it deploys.

## Adding a New Machine

Open `src/data/machines.js` and add an entry to the `machines` array:

```js
{
  id: 'machinename',       // URL slug — kebab-case, unique
  name: 'MachineName',     // display name
  os: 'linux',             // 'linux' | 'windows' | 'freebsd'
  diff: 'medium',          // 'easy' | 'medium' | 'hard' | 'insane'
  tags: ['SQLi', 'SUID'],  // techniques used
  date: '2026-05',         // YYYY-MM completed
  writeup: `
# MachineName

**Difficulty:** Medium | **OS:** Linux

## Overview
...
  `,
},
```

Push to main → auto-deploys. Card and writeup page generate automatically.

## Updating Certs

Edit `src/data/certs.js` — update `status`, `progress`, or add new entries.

## Project Structure

```
src/
├── data/
│   ├── machines.js     ← add boxes here
│   └── certs.js        ← update certs here
├── components/
│   ├── Nav.jsx / .module.css
│   ├── MachineCard.jsx / .module.css
│   ├── CertCard.jsx / .module.css
│   ├── OwlSVG.jsx
│   └── useReveal.js
├── pages/
│   ├── Home.jsx / .module.css
│   └── WriteupPage.jsx / .module.css
└── styles/
    └── global.css
```
