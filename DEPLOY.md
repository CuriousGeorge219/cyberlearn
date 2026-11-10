# ☁️ Deploying CyberLearn to Cloudflare (free)

This guide covers hosting your study platform on **Cloudflare** for free, with **cross-device progress sync** and an **optional login wall** so only you can access it.

You'll do three things:

1. **Deploy the app** (the static site) → Cloudflare Pages
2. **Deploy the sync backend** (a Worker + KV database)
3. **Turn on sync** inside the app

> ⏱️ Total time: ~20 minutes. You'll need a free [Cloudflare](https://dash.cloudflare.com/sign-up) account and [Node.js](https://nodejs.org) installed.

---

## Part 1 — Deploy the website (Cloudflare Pages)

The site is a plain `public/` folder — no build step needed.

1. Log in to the Cloudflare dashboard → **Workers & Pages** → **Create** → **Pages** → **Upload assets**.
2. Name the project (e.g. `cyberlearn`).
3. **Drag and drop the `public/` folder** into the upload box (or "select folder").
4. Click **Deploy**.

When it finishes, Cloudflare gives you a URL like:

```
https://cyberlearn-xxxx.pages.dev
```

Open it — your platform should load exactly like it does locally. (Your progress will start fresh there; that's expected — we'll add sync next.)

---

## Part 2 — Deploy the sync backend (Worker + KV)

This stores your progress in the cloud so it follows you across devices.

### 2a. Install Wrangler (Cloudflare's CLI)

```bash
npm install -g wrangler
wrangler login
```

### 2b. Create a KV namespace

From this project folder, run:

```bash
wrangler kv namespace create PROGRESS
```

It prints something like:

```
id = "abc123...your-namespace-id..."
```

Copy that `id`.

### 2c. Configure and deploy the Worker

1. Open `wrangler.toml` and replace `REPLACE_WITH_YOUR_KV_NAMESPACE_ID` with the id you copied.
2. Deploy:

```bash
wrangler deploy
```

It prints your Worker URL:

```
https://cyberlearn-sync.yourname.workers.dev
```

> **Tip:** if `wrangler login` fails (e.g. it can't open a browser), create an API token instead: Cloudflare dashboard → **My Profile → API Tokens → Create Token → "Edit Cloudflare Workers"** → copy the token → `export CLOUDFLARE_API_TOKEN=...` (or `set` on Windows).

---

## Part 3 — Turn on sync in the app

1. Open your deployed site (or the local one) and go to **☁️ Sync** in the sidebar.
2. **Worker URL:** paste your Worker URL, e.g. `https://cyberlearn-sync.yourname.workers.dev`
3. **Sync key:** click the 🎲 button to generate a strong random key — this is your password to your data. Use the **same URL and key on every device**.
4. Click **💾 Save & enable**.

That's it. Now:
- Progress **auto-saves** a couple of seconds after you study.
- When you open the site on another device (with the same URL + key), it **auto-downloads** your latest progress.
- Use **🔄 Sync now** to force a sync manually.

The little cloud icon in the top-right shows sync status: ☁️ idle · 🔄 saving · ✅ synced · ⚠️ error.

---

## Optional — put a login wall in front (recommended)

By default your site is public to anyone with the URL. Since this is copyrighted course material, add a free login gate so only *you* can open it:

1. Cloudflare dashboard → **Zero Trust** (or "Access") → sign up for the **free** plan.
2. **Access → Applications → Add an application → Self-hosted**.
3. Enter your Pages domain (e.g. `cyberlearn-xxxx.pages.dev`) and a policy that allows **only your email**.
4. Save. Now visitors must verify with a one-time code sent to your email before the site loads.

This also protects the `/sync` Worker URL if you add a second Access application for it — but your random sync key already acts as a password, so that's optional.

---

## Notes & limits

- **Free-tier limits are generous** for one person: Workers = 100k requests/day, KV = 1k writes/day & 100k reads/day.
- **Progress is per-browser, synced via the cloud.** If two devices are used at the same time, the most recent save wins (fine for a single user).
- **Your sync key is your only real secret** — keep it long and random, and don't put it anywhere public.

## Going back to local-only

Sync is opt-in. If you don't enter a Worker URL/key, the app behaves exactly as before — everything stays in your browser's `localStorage`.
