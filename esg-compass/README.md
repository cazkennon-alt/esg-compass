# ESG Compass — Kennon & Co

A free AI-powered ESG readiness diagnostic tool.

## Deploying to Vercel (no coding required)

### Option A: Deploy via Vercel website (easiest)

1. Go to [vercel.com](https://vercel.com) and sign up for a free account
2. From your dashboard, click **Add New → Project**
3. Click **"Import from a zip file"** (or drag the project folder)
4. Upload the `esg-compass.zip` file
5. Vercel will auto-detect it as a Vite project
6. Click **Deploy** — done!

Your tool will be live at a URL like `esg-compass.vercel.app`

### Option B: Deploy via GitHub (recommended for future updates)

1. Create a free [GitHub](https://github.com) account if you don't have one
2. Create a new repository called `esg-compass`
3. Upload all these files to the repository
4. Go to [vercel.com](https://vercel.com), sign up, and click **Add New → Project**
5. Connect your GitHub account and select the `esg-compass` repository
6. Click **Deploy**

Benefit of Option B: any future updates you push to GitHub will automatically redeploy.

### Custom domain (optional)

Once deployed, you can point a custom domain like `compass.kennonco.com` to your Vercel project:
1. In Vercel dashboard → your project → Settings → Domains
2. Add `compass.kennonco.com`
3. In your domain registrar (wherever kennonco.com is registered), add a CNAME record pointing `compass` to `cname.vercel-dns.com`

## Project structure

```
esg-compass/
├── index.html          # Entry point
├── package.json        # Dependencies
├── vite.config.js      # Build config
└── src/
    ├── main.jsx        # React root
    └── App.jsx         # The ESG Compass tool
```

## Making updates

To update the tool content (questions, prompts, styling), edit `src/App.jsx` and redeploy.
