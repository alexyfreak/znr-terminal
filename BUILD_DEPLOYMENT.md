# Build & Deployment Guide

## Desktop Application (Electron)

### Build Configuration
**File:** `electron-builder.json`

```json
{
  "appId": "uz.zunoora.app",
  "productName": "Zunoora",
  "copyright": "Copyright © 2026",
  "directories": {
    "output": "release",
    "buildResources": "build"
  },
  "files": [
    "out/**/*",
    "package.json",
    "!src/**/*",
    "!electron/**/*"
  ],
  "win": {
    "target": ["nsis"],
    "artifactName": "Zunoora-Setup-${version}.${ext}"
  },
  "nsis": {
    "oneClick": false,
    "perMachine": false,
    "allowToChangeInstallationDirectory": true,
    "createDesktopShortcut": true,
    "createStartMenuShortcut": true,
    "shortcutName": "Zunoora"
  }
}
```

### Build Process
```bash
# Install dependencies
npm install

# Development build
npm run dev

# Production build
npm run build
# Output: out/main/index.js, out/renderer/index.html

# Package for Windows
npm run package:win
# Output: release/Zunoora-Setup-1.0.0.exe

# Package unpacked (faster for testing)
npm run package:dir
# Output: release/win-unpacked/
```

### Vite Configuration
**File:** `electron.vite.config.ts`

```typescript
import { defineConfig } from 'electron-vite';

defineConfig({
  main: {
    // Main process build
  },
  preload: {
    // Preload script build
  },
  renderer: {
    // Renderer process build (same as webapp)
  }
});
```

### Bundle Exclusions
- Source maps removed in production
- Dev dependencies excluded
- Source files excluded (`!src/**/*`)
- 1200x800 window size
- DevTools disabled in production

## Web Application (Vite + Vercel)

### Build Configuration
**File:** `webapp/vite.config.ts`

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'terser'
  }
});
```

### Build Process
```bash
cd /home/alexy/zunosh/webapp

# Install dependencies
npm install

# Development server
npm run dev
# Server: localhost:5173

# Production build
npm run build
# Output: webapp/dist/

# Type checking
npm run type-check

# Deploy to Vercel
npx vercel --prod
```

### Environment Variables
**File:** `webapp/.env`
```env
VITE_SUPABASE_URL=<PROD_URL>
VITE_SUPABASE_ANON_KEY=<PROD_ANON_KEY>
VITE_TELEGRAM_BOT_URL=https://t.me/zunoorabot
VITE_APP_URL=https://zunoora-webapp.vercel.app
```

## Shared Build Scripts

### Root Package.json Scripts
```json
{
  "scripts": {
    "setup": "node scripts/setup.mjs",
    "dev": "electron-vite dev",
    "build": "electron-vite build",
    "preview": "electron-vite preview",
    "package:win": "electron-vite build && electron-builder --win --config",
    "package:dir": "electron-vite build && electron-builder --win --dir --config"
  }
}
```

### Setup Script
**File:** `/home/alexy/zunosh/scripts/setup.mjs`

```javascript
// Installs dependencies for both projects
// Runs npm install in root and webapp/
// Copies .env.example to .env if not exists
// Validates Supabase credentials
```

## Database Deployment

### Supabase Migrations
```bash
# Location: /home/alexy/zunosh/supabase/

# Create new migration
supabase migration new <name>

# Apply locally
supabase db push

# Deploy to production
supabase db push --project-ref ixwujmimgafnckqlezud

# Generate seed data for production
supabase db reset --with-seed
```

### RLS Policy Deployment
```bash
# Enable RLS on all tables
ALTER TABLE webapp_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE children ENABLE ROW LEVEL SECURITY;
ALTER TABLE ariza_requests ENABLE ROW LEVEL SECURITY;

# Apply policies
supabase policies apply
```

## Testing Before Deployment

### Desktop Pre-flight Checklist
- [ ] Build in production mode: `npm run build`
- [ ] Test DOCX generation
- [ ] Test payment flow (sandbox)
- [ ] Verify template CRUD
- [ ] Check IPC communication
- [ ] Window size 1200x800 correct
- [ ] Test on Windows VM
- [ ] Check installer size < 200MB
- [ ] Verify NSIS signing (production)

### WebApp Pre-flight Checklist
- [ ] Build success: `npm run build`
- [ ] Type checking passes
- [ ] Test all roles (PRT/STCH/TCH/DRK/SCH)
- [ ] Verify Supabase RLS policies
- [ ] Real-time subscriptions working
- [ ] Telegram bot functioning
- [ ] Test on mobile browser
- [ ] Lighthouse score > 80
- [ ] Upload size < 5MB

## Production Deployment

### Desktop Release (v1.0.0)
```bash
# 1. Bump version (manual edit package.json)
# "version": "1.1.0"

# 2. Update CHANGELOG.md

# 3. Build and package
npm run package:win

# 4. Sign installer (if configured)
codesign --deep --force --sign "Developer ID" release/Zunoora-Setup-1.1.0.exe

# 5. Upload to release server
gh release create v1.1.0 release/Zunoora-Setup-1.1.0.exe \
  --title "Zunoora v1.1.0" \
  --notes "Release notes..."

# 6. Update Telegram bot notification
bot.sendMessage(`New version available: v1.1.0`);
```

### WebApp Release (v1.0.0)
```bash
# Develop in webapp branch
cd /home/alexy/zunosh/webapp

# Test locally
npm run dev

# Create production build
npm run build

# Deploy to Vercel
npx vercel --prod

# Verify deployment
open https://zunoora-webapp.vercel.app

# Update Telegram bot webhook
https://api.telegram.org/bot<token>/setWebhook
?url=https://zunoora-webapp.vercel.app/api/bot

# Clear CDN cache if needed
```

## Rollback Plans

### Desktop Rollback
```bash
# Restore previous version
gh release download v1.0.0
# Redistribute installer
```

### WebApp Rollback
```bash
# Vercel automatically keeps previous deployments
# Switch via Vercel dashboard or:
vercel --prod --meta version=v1.0.0
```

## CI/CD (Future Enhancement)
```yaml
# .github/workflows/build-desktop.yml
name: Build Desktop
on:
  push:
    tags: ['v*']
jobs:
  build:
    runs-on: windows-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm install
      - run: npm run package:win
      - uses: actions/upload-artifact@v3
        with:
          path: release/Zunoora-Setup-*.exe
```

## Environment-Specific Variables

### Development (.env.local)
```env
SUPABASE_URL=https://ixwujmimgafnckqlezud.supabase.co
SUPABASE_ANON_KEY=eyJhbGci...
PAYME_ID=test
PAYME_KEY=test_secret
CLICK_SERVICE_ID=test
CLICK_MERCHANT_ID=test
CLICK_SECRET_KEY=test_secret
```

### Production (.env)
```env
SUPABASE_URL=https://ixwujmimgafnckqlezud.supabase.co
SUPABASE_ANON_KEY=eyJhbGci... (production key)
PAYME_ID=live_id
PAYME_KEY=live_secret_key
CLICK_SERVICE_ID=live_service
CLICK_MERCHANT_ID=live_merchant
CLICK_SECRET_KEY=live_secret
```

## Monitoring

### Desktop
- Error tracking: BugReport component
- Usage analytics: Custom events to Supabase
- Version tracking: analytics table
- Crash reports: bug_reports table

### WebApp
- Supabase analytics: pg_stats_system
- Vercel analytics: Build stats
- Custom logs: log_events table
- Error tracking: Sentry (Optional)