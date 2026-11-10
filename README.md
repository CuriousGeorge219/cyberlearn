# 🛡️ CyberLearn — Interactive Cybersecurity Study Platform

A fully local, interactive learning platform built from your course materials across four modules:

| Module | Short | Content | Lessons | Flashcards | Quiz Qs |
|---|---|---|---|---|---|
| CyberOps Associate | CSO | Cisco CyberOps Associate v1.0 | 28 | ~1,960 | ~1,390 |
| Network Analysis & Forensics | NAF | Packet analysis & forensics | 12 | ~740 | ~590 |
| Firewall Technologies | Firewall | Perimeter defence, VPN, IDS, DR | 10 | ~300 | ~290 |
| AI in Cybersecurity | AIC | ML, GenAI, agentic AI & ethical hacking | 10 | ~600 | ~510 |

## ✨ Features

- **Study / Read mode** — clean, formatted lesson reader with **key-terms highlighted inline**, a **"Key takeaways" summary box**, and a **lesson roadmap** of section topics.
- **Active recall mode** — bullet points are blurred until you click to reveal, forcing you to recall before seeing the answer.
- **Flashcards with spaced repetition** — a full SM-2 scheduler (Again / Hard / Good / Easy) that automatically spaces reviews over days. Keyboard: `Space` flip, `1–4` grade.
- **Quizzes** — multiple choice, true/false, and fill-in-the-blank with instant feedback, explanations, and a review of missed questions.
- **🧩 Concept diagrams** — 17 hand-built visual diagrams (OSI model, TCP handshake, CIA triad, PKI, encryption, NAT, SOC flow, forensics process, and more), linked automatically from the lessons they relate to.
- **🎮 Gamification** — earn XP for every lesson, card, and quiz; rank up from *Script Kiddie* to *CISO*; unlock 16 achievements; build a daily streak.
- **☁️ Cross-device sync** — optionally sync all progress between devices using a free Cloudflare Worker + KV backend (see [DEPLOY.md](DEPLOY.md)).
- **Progress tracking** — lesson completion, card mastery, quiz scores, XP, and rank, all saved locally.
- **Search** — find any lesson or term instantly.
- **Works offline** — everything runs in your browser; nothing is uploaded anywhere (unless you enable cloud sync).

## 🚀 How to run

### Option A — Local server (recommended, works in any browser)

```bash
npm install        # first time only
npm start
```

Then open **http://localhost:8080**

### Option B — Open directly (no server needed)

Open `public/index.html` in **Chrome or Edge** (double-click it). No build step or server required.

### Option C — Host it on the web (free)

See **[DEPLOY.md](DEPLOY.md)** for step-by-step instructions to deploy to **Cloudflare Pages** for free, including cross-device sync and an optional private login wall.

## 🔁 Rebuilding the content data

The platform ships with `public/data.js` already generated. If you add or change course files in the module folders (`CSO/`, `NAF/`, `Firewall/`, `AIC/`), regenerate it with:

```bash
npm run build
```

This re-extracts all PDF/PPTX text and regenerates the flashcard and quiz banks.

## 📁 Project structure

```
├── CSO/  NAF/  Firewall/  AIC/   ← your source course files
├── build-data.js                 ← extracts text + generates cards/quizzes
├── extract.js                    ← PDF & PPTX text extraction helpers
├── server.js                     ← tiny local HTTP server
├── sync-worker.js                ← Cloudflare Worker for cross-device sync
├── wrangler.toml                 ← Cloudflare Worker config
├── DEPLOY.md                     ← free hosting + sync setup guide
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

All progress, card schedules, and quiz scores are stored in your browser's `localStorage`. Nothing is sent to any server. Use **Progress → Reset all progress** to start fresh.
