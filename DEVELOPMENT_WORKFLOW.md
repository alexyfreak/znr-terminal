# Development Workflow Guide

## Quick Commands

### Desktop App
```bash
# Install dependencies
npm install

# Development (with hot reload)
npm run dev

# Build production
npm run build

# Preview build
npm run preview

# Package for Windows
npm run package:win        # NSIS installer
npm run package:dir        # Unpacked directory

# Run tests
npm test

# Type checking
npm run type-check
```

### WebApp
```bash
cd webapp

# Install dependencies
npm install

# Development
npm run dev              # localhost:5173

# Build production
npm run build

# Type checking
npm run type-check

# Deploy to Vercel
npx vercel --prod
```

## Authentication & Testing

### Default Test Credentials
| Role | ID | Password | Notes |
|------|-----|----------|-------|
| Teacher | TCH00001 | 1234 | Can create templates |
| Director | DRK00001 | 1234 | Admin access |
| Parent | PRT00001 | parent123 | WebApp only |
| Sinf Rahbar | STCH00001 | sinf123 | WebApp only |

### Supabase Auth
- Passwords stored with scrypt hashing
- Role detection via ID prefix
- RLS (Row Level Security) enabled on all tables

## Common Development Tasks

### 1. Add New Component

**Desktop Component:**
```bash
# Use shadcn/ui
cd /home/alexy/zunosh
npx shadcn@latest add button

# Or create manually
create /home/alexy/zunosh/src/renderer/src/components/NewComponent/index.tsx
```

**WebApp Component:**
```bash
cd /home/alexy/zunosh/webapp
npx shadcn@latest add button

# Manual creation
create /home/alexy/zunosh/webapp/src/components/NewComponent.tsx
```

### 2. Add Translation

**Add to all locale files:**
```bash
# Desktop: /home/alexy/zunosh/src/renderer/src/locales/
# Files: en.json, ru.json, uz.json

{
  "newKey": "New Translation",
  "section.key": "Nested Translation"
}
```

**Use in component:**
```typescript
import { useTranslation } from 'react-i18next';

const { t } = useTranslation();
const label = t('newKey');
```

### 3. Database Changes

**Add new table:**
```bash
# Edit: /home/alexy/zunosh/supabase/
supabase migration new create_new_table
```

**Seed test data:**
```sql
-- Edit: /home/alexy/zunosh/webapp/db/seed.sql
INSERT INTO table (column) VALUES ('test');
```

**Apply locally:**
```bash
supabase db push
```

### 4. Template Development

**Add template:**
```bash
# Desktop: use ShablonBuilder component
# Creates entry in 'shablons' table

# Fields structure:
{
  "steps": [{"id": "step1", "name": "Step 1"}],
  "fields": [{"id": "field1", "label": "Name", "type": "text", "required": true}],
  "outputs": [{"type": "docx", "docx_template": "template.docx"}]
}
```

**Test template:**
```bash
# Desktop dev mode shows live preview
# Variables: {{field1}}, {{date}}, {{school_name}}
```

### 5. Payment Integration

**Test Payme:**
```bash
# Sandbox mode in development
# Config: .env local
PAYME_ID=test
PAYME_KEY=secret
```

**Test Click:**
```bash
CLICK_SERVICE_ID=test
CLICK_MERCHANT_ID=test
CLICK_SECRET_KEY=secret
```

## Debugging

### Desktop App
```bash
# Enable DevTools
# DevTools toggle in main menu

# Check IPC logs
# Console: window.electron.ipcRenderer

# Supabase queries
# Enable debug mode in db.ts
```

### WebApp
```bash
# Browser DevTools
# Network tab for Supabase queries
# Console for errors

# Supabase debug
localStorage.debug = 'supabase:realtime*'
```

## Data Flow Examples

### Document Generation
```
User → ShablonBuilder → Save template to shablons table
User → DocumentEditor → Load template → Fill variables → Generate DOCX → Download
```

### Leave Request (Ariza)
```
Parent → WebApp → Submit ariza request -> Real-time notification → Teacher → Approve/Reject → Parent notified
```

### Template Purchase
```
User → Desktop → Select template → PaymentCheckout → Payme/Click → Credit purchase → Unlock template
```

## Deployment Checklist

### Desktop Release
- [ ] Bump version in package.json
- [ ] Test on Windows machine
- [ ] Verify payment flow
- [ ] Check DOCX generation
- [ ] Build with `npm run package:win`
- [ ] Upload installer to release
- [ ] Update Telegram bot with new version

### WebApp Release
- [ ] Test all roles (PRT/STCH/TCH/DRK/SCH)
- [ ] Verify Supabase RLS policies
- [ ] Run seed.sql in production
- [ ] Deploy via Vercel
- [ ] Test real-time features
- [ ] Verify Telegram notifications

## Common Issues

### Desktop Wont Start
```bash
# Clear node_modules
rm -rf node_modules package-lock.json
npm install

# Reset out directory
rm -rf out/
npm run build
```

### Connection Errors
- Check SUPABASE_URL/ANON_KEY in .env
- Verify network connection
- Check Access-Control headers

### Template Variables Not Replacing
- Verify field IDs match template placeholders
- Check field type conversion
- Debug renderer.ts

## MCP Development
- Supabase MCP enabled in opencode.json
- Use for queries instead of direct SQL
- Token optimization: auto compaction enabled
- Reserved tokens: 8000

## Token Optimization Tips
1. Don't re-read files already in context
2. Use partial reads: view with offset/limit
3. Route command output to files: `cmd > out.log`
4. Run `/compact` at logical breakpoints
5. Limit to 3 auto-compactions before `/reset`