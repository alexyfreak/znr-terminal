# Quick Reference Guide

## 🎯 Token-Optimized Documentation

### Core Architecture (Reference This First)
**File:** `PROJECT_ARCHITECTURE.md` (18,000 bytes compressed via headroom)
- System architecture diagram
- Tech stack overview
- Directory structure
- Data flow patterns
- Key components list

### Development Tasks
**File:** `DEVELOPMENT_WORKFLOW.md`
- npm scripts reference
- Quick commands for common tasks
- Translation workflow
- Database migration steps
- Template development
- Payment testing
- Debugging tips

### Database Reference
**File:** `DATABASE_SCHEMA.md`
- Table schemas
- ID naming conventions (PRT, TCH, DRK, STCH, SCH, PPL)
- RLS policies
- Indexes
- Sample queries
- Supabase MCP config

### Build & Deployment
**File:** `BUILD_DEPLOYMENT.md`
- Build commands
- Electron packaging
- Vercel deployment
- Environment variables
- Testing checklist
- Rollback procedures

---

## 🔍 Search First: Don't Re-read Everything

### When you need to:
1. **Find a component**: Use `grep` with component name
2. **Check database schema**: Reference DATABASE_SCHEMA.md
3. **Run a script**: Check DEVELOPMENT_WORKFLOW.md
4. **Understand flow**: Check PROJECT_ARCHITECTURE.md
5. **Build/deploy**: Check BUILD_DEPLOYMENT.md

### Use grep for code searches:
```bash
# Find component definitions
grep -r "function ComponentName" src/

# Find database table usage
grep -r "table_name" electron/

# Find IPC handlers
grep -r "ipcRenderer" electron/preload/

# Find payment references
grep -r "payme\|click" electron/payment.ts
```

### Use partial file reads:
```bash
# Read specific line range (avoid full file)
view /home/alexy/zunosh/electron/main/auth.ts 1 50

# Check specific section
read /home/alexy/zunosh/src/renderer/src/App.tsx 1 100
```

---

## 📊 Documents at a Glance

| Document | Size | When to Use | Key Sections |
|----------|------|-------------|--------------|
| PROJECT_ARCHITECTURE.md | 18KB | New to project | Architecture, flows, decisions |
| DEVELOPMENT_WORKFLOW.md | Medium (1000 lines) | Daily dev | Scripts, commands, workflows |
| DATABASE_SCHEMA.md | Large (2000 lines) | DB work | Tables, queries, RLS |
| BUILD_DEPLOYMENT.md | Medium (800 lines) | Release time | Package, deploy, test |
| README.md | Medium (750 lines) | Overview | Problem, solution, features |
| opencode.json | Small (20 lines) | Config | MCP, compaction |

---

## 💡 Token-Saving Tips

### 1. Never Re-read Full Files
```bash
# ❌ Bad: Reads entire file
cat /home/alexy/zunosh/electron/main/auth.ts

# ✅ Good: Reads only needed section
view /home/alexy/zunosh/electron/main/auth.ts 40 80
```

### 2. Use Cached Knowledge
```bash
# Write to memory once
serena_write_memory context "Project structure is dual-platform (Electron Desktop + React WebApp)"

# Reference later via memory
serena_read_memory context
```

### 3. Batch Independent Searches
```bash
# Run multiple greps in parallel
grep -r "function auth" electron/main/auth.ts &
grep -r "supabase" .env &
grep -r "payment" electron/main/payment.ts &
wait
```

### 4. Route Output to File
```bash
# Save large outputs
grep -r "import" src/ > /tmp/imports.txt

# Read only when needed
cat /tmp/imports.txt | grep "Auth"
```

### 5. Compact at Breakpoints
```bash
# Run after major task completion
/compact

# After 3 compactions, reset for fresh context
/reset
```

---

## 🔑 Quick Credential Reference

### Test Accounts (WebApp)
| Role | ID | Password | File |
|------|-----|----------|------|
| Parent | PRT00001 | parent123 | DATABASE_SCHEMA.md |
| Sinf Rahbar | STCH00001 | sinf123 | DATABASE_SCHEMA.md |
| Teacher | TCH00001 | tch123 | DATABASE_SCHEMA.md |
| Director | DRK00001 | dir123 | DATABASE_SCHEMA.md |
| School | SCH00001 | school123 | DATABASE_SCHEMA.md |
| Pupil | PPL000001 | pupil123 | DATABASE_SCHEMA.md |

### Environment Variables
**Location:** `.env.local`
```env
SUPABASE_URL=see .env.local
SUPABASE_ANON_KEY=see .env.local
PAYME_ID=test
PAYME_KEY=test_secret
CLICK_SERVICE_ID=test
CLICK_MERCHANT_ID=test
CLICK_SECRET_KEY=test_secret
```

### Supabase Details
- **Project**: ixwujmimgafnckqlezud
- **URL**: https://ixwujmimgafnckqlezud.supabase.co
- **MCP**: Enabled in opencode.json

---

## 📦 Build Commands Cheat Sheet

### Desktop Development
```bash
npm run dev              # Start Electron app
npm run build           # Build production
npm run package:win     # Create installer
npm run package:dir     # Unpacked for testing
```

### WebApp Development
```bash
cd webapp
npm run dev             # localhost:5173
npm run build          # Production build
npx vercel --prod      # Deploy to Vercel
```

### Database Management
```bash
supabase migration new <name>   # New migration
supabase db push                # Apply locally
supabase db reset               # Reset with seed
```

---

## 💾 Memory Usage Optimization

### Context Size Facts
- **Auto-compaction**: Enabled (opencode.json)
- **Reserved tokens**: 8,000
- **Tail turns**: 15
- **Max compactions before reset**: 3
- **Default MCP servers**: 1 (Supabase only, saves 2-5K tokens)

### MCP Servers (Currently)
- **Supabase**: Enabled (remote)
- **Other MCPs**: Disabled to save tokens
- **Each disabled MCP saves**: 2,000-5,000 tokens

### Recommended Flow
1. Start session → Read only what's needed
2. After 3-4 major tasks → /compact
3. After 3 compactions → /reset for fresh context
4. Use memory files for decisions
5. Batch unrelated tool calls

---

## 🚦 File Modification Rules

### Read-only directories (NEVER edit):
- `/mnt/user-data/uploads/`
- `/mnt/transcripts/`
- `/mnt/skills/public/`
- `/mnt/skills/private/`
- `/mnt/skills/examples/`

### Safe to edit:
- Project root: `/home/alexy/zunosh/`
- Source code: `/home/alexy/zunosh/src/`
- WebApp: `/home/alexy/zunosh/webapp/`
- Config files: `/home/alexy/zunosh/opencode.json`

---

## 🔐 Security Checklist

### Before committing:
- [ ] No hardcoded credentials
- [ ] .env files in .gitignore
- [ ] Supabase credentials use anon key
- [ ] Passwords hashed with scrypt
- [ ] RLS policies enabled
- [ ] Rate limiting configured
- [ ] Input validation with zod

---

## 📱 Deployment Checklist

### Desktop Release
- [ ] Bump version in package.json
- [ ] Test DOCX generation
- [ ] Verify payment flow
- [ ] Test on Windows VM
- [ ] Package size < 200MB
- [ ] Installer signing (prod)
- [ ] Update release notes

### WebApp Release
- [ ] Test all 5 roles
- [ ] Verify Supabase RLS
- [ ] Run seed.sql in prod
- [ ] Build size < 5MB
- [ ] Lighthouse score > 80
- [ ] Update bot webhook

---

## 🎯 Most Common Searches

By frequency of need:
1. **Adding components** → Check DEVELOPMENT_WORKFLOW.md
2. **Database queries** → Check DATABASE_SCHEMA.md
3. **Template structure** → Check PROJECT_ARCHITECTURE.md
4. **Build commands** → Check DEVELOPMENT_WORKFLOW.md or BUILD_DEPLOYMENT.md
5. **Authentication** → Check DATABASE_SCHEMA.md (webapp_users table)
6. **Payment testing** → Check DEVELOPMENT_WORKFLOW.md or opencode.json
7. **IPC handlers** → Check PROJECT_ARCHITECTURE.md
8. **Environment setup** → Check BUILD_DEPLOYMENT.md
9. **Design tokens** → Check SKILL.md
10. **Error handling** → Check electron/main/errors.ts

---

## 📚 Supporting Documentation

See project root for:
- `README.md` - Business overview and features
- `CLAUDE.md` - Token optimization rules
- `SKILL.md` - Design system specs
- `LICENSE.md` - MIT license
- `.opencode/AGENTS.md` - Full project context
- `.env.example` - Environment variables template

---

## 📝 Summary

**For token optimization:**
1. Always search these docs FIRST
2. Use compressed versions via headroom when possible
3. Use grep for code searches (not full reads)
4. Use partial reads with offset/limit
5. Use `/compact` at logical breakpoints
6. Store decisions in memory files
7. Batch tool calls when independent
8. Limit to 3 auto-compactions per session

**This saves ~60-90% token usage.**