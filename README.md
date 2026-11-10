# 🛡️ CyberLearn — Interactive Cybersecurity Study Platform

An interactive, gamified study platform for cybersecurity course content, built from four modules:

| Module | Short | Content | Lessons | Flashcards | Quiz Qs |
|---|---|---|---|---|---|
| CyberOps Associate | CSO | Cisco CyberOps Associate v1.0 | 28 | ~1,960 | ~1,390 |
| Network Analysis & Forensics | NAF | Packet analysis & forensics | 12 | ~740 | ~590 |
| Firewall Technologies | Firewall | Perimeter defence, VPN, IDS, DR | 10 | ~300 | ~290 |
| AI in Cybersecurity | AIC | ML, GenAI, agentic AI & ethical hacking | 10 | ~600 | ~510 |

## ✨ Features

- **Study / Read mode** — clean lesson reader with key-terms highlighted inline, a **"Key takeaways"** summary, and a **lesson roadmap**.
- **Active recall mode** — bullet points blur until you click to reveal, forcing recall before seeing the answer.
- **Flashcards + spaced repetition** — a full SM-2 scheduler (Again / Hard / Good / Easy) that spaces reviews over days. Keyboard: `Space` flip, `1–4` grade.
- **Quizzes** — multiple choice, true/false, and fill-in-the-blank with instant feedback and explanations.
- **🧩 Concept diagrams** — 17 hand-built visual diagrams (OSI model, TCP handshake, CIA triad, PKI, encryption, NAT, SOC flow, forensics, and more), linked automatically from the lessons they relate to.
- **🎮 Gamification** — earn XP for every lesson, card, and quiz; rank up from *Script Kiddie* to *CISO*; unlock 16 achievements; build a daily streak.
- **☁️ Cross-device sync** — optionally sync all progress between devices by entering a **sync key** (the backend is pre-configured; no setup required).
- **📱 Mobile-friendly** — collapsible sidebar and responsive layout that works on phones.
- **Search** — find any lesson or term instantly.

## 🌐 Live

The site is hosted on Cloudflare Pages and auto-deploys from this repository on every push to `main`.

## 🚀 Run locally

```bash
npm install   # first time only
npm start     # → http://localhost:8080
```

Or just open `public/index.html` in Chrome/Edge — no server needed.

## 🔁 Rebuilding the content

The app ships with `public/data.js` already generated. To regenerate it from your source files, run:

```bash
npm run build
```

*(Note: the source PDFs/PPTXs in `CSO/`, `NAF/`, `Firewall/`, and `AIC/` are git-ignored — they stay on your machine and are only needed to rebuild the data.)*

## ☁️ Cross-device sync

Sync is opt-in and key-based:

1. Open the site → **☁️ Sync** in the sidebar.
2. Enter (or generate with 🎲) a **sync key**.
3. **Save & enable**.

Use the **same key** on every device to share progress. The sync key acts like a password to your data — keep it long and random.

## 📁 Project structure

```
├── build-data.js                 ← extracts text + generates cards/quizzes
├── extract.js                    ← PDF & PPTX text extraction helpers
├── server.js                     ← tiny local HTTP server
├── sync-worker.js                ← Cloudflare Worker for cross-device sync
├── wrangler.toml                 ← Cloudflare Worker config
├── .github/workflows/deploy.yml  ← auto-deploy to Cloudflare Pages on push
├── DEPLOY.md                     ← deployment + sync setup guide
├── package.json
└── public/
    ├── index.html                ← the app shell
    ├── styles.css                ← styling
    ├── app.js                    ← all app logic (SPA, SM-2, quiz, gamification, sync)
    ├── diagrams.js               ← hand-built SVG concept diagrams
    ├── data.js                   ← generated course data (auto-loaded)
    └── data.json                 ← same data, human-readable reference
```

## 💾 Data & privacy

All progress, card schedules, and quiz scores are stored in your browser's `localStorage` by default. Nothing is uploaded unless you opt in to cloud sync (and then only to your own sync-key slot). Use **Progress → Reset all progress** to start fresh.

## 🚀 Deployment

The site deploys to **Cloudflare Pages** from this repository automatically. See [DEPLOY.md](DEPLOY.md) for the full setup (including the sync Worker + KV backend).
