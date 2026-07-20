# Ultimate Startup Skills & MCP Integration Guide

> For Claude Code · Claude Fable 5 · Opencode · Codex

---

## 1. Top Skill Collections (One-Shot Install)

| Collection | Skills | Install Command |
|---|---|---|
| **awesome-opencode-skills** (jshsakura) | 136+ skills across 10 categories | `irm https://raw.githubusercontent.com/jshsakura/awesome-opencode-skills/main/install.ps1 \| iex` (Win) or `curl -sL https://raw.githubusercontent.com/jshsakura/awesome-opencode-skills/main/install.sh \| bash` (Mac/Linux) |
| **awesome-opencode-skills** (jamait) | 100+ doc/dev/biz skills | `npx skills add https://github.com/jamait/awesome-opencode-skills` |
| **Obra Superpowers** | Full dev methodology (TDD, plans, review) | Add to opencode.json: `"plugin": ["superpowers@git+https://github.com/obra/superpowers.git"]` |
| **UX/UI Mastery** (phazurlabs) | 19 skills, 55 refs, 10 commands | `/plugin marketplace add phazurlabs/ux-ui-mastery` then `/plugin install ux-ui-mastery@ux-ui-mastery-marketplace` |
| **claude-code-ui-agents** | 50+ UI/UX design prompts | `git clone https://github.com/mustafakendiguzel/claude-code-ui-agents` |
| **opencode-secops-blueprint** | Full DevSecOps pipeline | `git clone https://github.com/AmidVoshakul/opencode-secops-blueprint` |

---

## 2. Skills by Category (Must-Haves for Startups)

### 🎨 UI/UX Design

| Skill | What It Does | Install |
|---|---|---|
| **ui-ux-pro-max-skill** | 84K stars — design system generator, 161 industries, 50 styles | `npx skills add https://github.com/nextlevelbuilder/ui-ux-pro-max-skill` |
| **frontend-design** (Anthropic official) | Creative UI generation, aesthetic personality | `/plugin marketplace add anthropics/claude-code` then select frontend-design |
| **web-design-guidelines** (Vercel) | 100+ rules: a11y, performance, UX | `npx skills add https://github.com/vercel-labs/agent-skills --skill web-design-guidelines` |
| **react-best-practices** (Vercel) | React/Next.js perf, RSC, SSR patterns | `npx skills add https://github.com/vercel-labs/agent-skills --skill react-best-practices` |
| **taste-skill** | Design taste linter, brand consistency | `npx skills add https://github.com/anthropics/skills --skill taste-skill` |
| **artifacts-builder** | HTML artifacts with React/Tailwind/shadcn | `npx skills add https://github.com/jamait/awesome-opencode-skills --skill artifacts-builder` |
| **design-bridge** | Generates DESIGN.md from specs | Included in awesome-opencode-skills (jshsakura) |

### ⚙️ Backend / API Development

| Skill | What It Does | Install |
|---|---|---|
| **backend-developer** | Scoped backend impl, bug fixes, auth, validation | Included in awesome-opencode-skills (jshsakura) |
| **api-designer** | API contract design, evolution planning | Included in awesome-opencode-skills (jshsakura) |
| **fullstack-developer** | Full-stack features across the stack | Included in awesome-opencode-skills (jshsakura) |
| **code-mapper** | Map code paths, ownership, execution flow | Included in awesome-opencode-skills (jshsakura) |

### 🧪 Testing / QA

| Skill | What It Does | Install |
|---|---|---|
| **testing-typescript-vitest** | TypeScript/Vitest testing patterns | `npx skills add https://github.com/open-hax/opencode-skills --skill testing-typescript-vitest` |
| **test-driven-development** | Red/green/refactor TDD workflow | Included in Obra Superpowers |
| **playwright-mcp** | Browser automation testing | `claude mcp add playwright -- npx -y @playwright/mcp` |
| **security-reviewer** | SAST, dependency audit, secrets scanning | Included in awesome-opencode-skills (jshsakura) |

### 🔒 Security / DevSecOps

| Skill | What It Does | Install |
|---|---|---|
| **security-reviewer** (synapse/farmage) | Full security audit, vuln detection, CVSS scoring | Clone from `https://github.com/synapse-ai-hub/opencode-skills` |
| **penetration-tester** (mohamednaeem92) | PTES methodology, OWASP, red team | Clone from `https://github.com/mohamednaeem92-max/OPENCODE-6-2026` |
| **secure-code-guardian** | Code-level security hardening | Included in awesome-opencode-skills (jshsakura) |
| **powershell-security-hardening** | Windows security posture | Included in awesome-opencode-skills (jshsakura) |
| **opencode-secops-blueprint** | Full pipeline: SAST → DAST → compliance → SIEM | `git clone https://github.com/AmidVoshakul/opencode-secops-blueprint` |

### 🗄️ Database

| Skill / MCP | What It Does |
|---|---|
| **PostgreSQL MCP** | Query, inspect schemas, write migrations |
| **Supabase MCP** | Full Supabase: auth, DB, storage, edge functions |
| **Neon MCP** | Serverless Postgres |
| **SQLite MCP** | Local SQLite management |
| **Redis MCP** | Cache, session store, pub/sub |
| **MongoDB MCP** | Document DB queries, aggregation pipelines |

### ☁️ DevOps / Cloud / Deploy

| Skill / MCP | What It Does | Install |
|---|---|---|
| **Vercel MCP** | Deploy management, build logs, env vars | `claude mcp add vercel -- npx -y @vercel/mcp` |
| **Cloudflare MCP** | Workers, KV, R2, D1, AI | `claude mcp add cloudflare -- npx -y cloudflare-mcp` |
| **AWS MCP** | Bedrock, S3, Lambda, etc. | `claude mcp add aws -- npx -y @aws/mcp` |
| **Docker Hub MCP** | Container management | `claude mcp add docker -- npx -y docker-mcp` |
| **Sentry MCP** | Error tracking, performance monitoring | `claude mcp add sentry -- npx -y @sentry/mcp` |
| **devops-engineer** | CI/CD pipeline design | Included in awesome-opencode-skills (jshsakura) |

### 🤖 AI / Data Science

| Skill | What It Does |
|---|---|
| **data-scientist** | Statistical rigor, hypothesis testing, experiment design |
| **data-analyst** | Metric breakdown, trend analysis, decision support |
| **deep-research** | Multi-source fact-checked research reports |

### 📋 Project Management / Productivity

| MCP Server | What It Does | Install |
|---|---|---|
| **GitHub MCP** | Issues, PRs, commits, code search | `claude mcp add github -- npx -y @github/mcp` |
| **Linear MCP** | Issue management, sprint tracking | `claude mcp add linear -- npx -y @linear/mcp` |
| **Notion MCP** | Docs, wikis, databases | `claude mcp add notion -- npx -y @notion/mcp` |
| **Jira MCP** | Issue tracking, agile boards | `claude mcp add jira -- npx -y @jira/mcp` |
| **Slack MCP** | Messaging, channels, search | `claude mcp add slack -- npx -y @slack/mcp` |
| **Google Drive MCP** | Docs, sheets, drive management | `claude mcp add gdrive -- npx -y @google/mcp` |

### 💰 Business / Fintech

| MCP Server | What It Does |
|---|---|
| **Stripe MCP** | Payments, subscriptions, invoices |
| **PostHog MCP** | Product analytics, feature flags, session replays |
| **Brave Search MCP** | Web research, competitor analysis |
| **Exa MCP** | Deep web search, company research |

### ✍️ Documentation / Writing

| Skill | What It Does |
|---|---|
| **ai-writing-auditor** | Removes AI writing patterns, naturalizes prose |
| **Changelog Generator** | Auto changelogs from git commits |
| **docx / pdf / pptx / xlsx** | Document creation and manipulation |
| **technical-writer** | Technical documentation generation |

---

## 3. Essential MCP Servers (Pick 3-7 max)

Rule: Don't install more than 5-7 MCPs. Each costs ~2K-5K tokens per session.

### The Startup Stack (Recommended)

```
# Core Dev
claude mcp add github -- npx -y @github/mcp-server
claude mcp add filesystem -- npx -y @modelcontextprotocol/server-filesystem

# Database
claude mcp add postgres -- npx -y @anthropic/server-postgres

# Deploy & Monitor
claude mcp add vercel -- npx -y @vercel/mcp
claude mcp add sentry -- npx -y @sentry/mcp

# Research
claude mcp add brave-search -- npx -y @anthropic/server-brave-search

# Product Analytics
claude mcp add posthog -- npx -y @posthog/mcp
```

### Other Top MCPs Worth Knowing

| Category | Server | Install |
|---|---|---|
| Browser | Playwright | `claude mcp add playwright -- npx -y @playwright/mcp` |
| Design | Figma | `claude mcp add figma -- npx -y @figma/mcp` |
| Payments | Stripe | `claude mcp add stripe -- npx -y @stripe/mcp` |
| Search | Exa | `claude mcp add exa -- npx -y @exa/mcp` |
| Memory | Memory | `claude mcp add memory -- npx -y @modelcontextprotocol/server-memory` |
| Analytics | PostHog | `claude mcp add posthog -- npx -y @posthog/mcp` |
| Cloud | Cloudflare | `claude mcp add cloudflare -- npx -y cloudflare-mcp` |
| Reasoning | Sequential Thinking | `claude mcp add sequential-thinking -- npx -y @modelcontextprotocol/server-sequential-thinking` |

---

## 4. Platform-Specific Install Notes

### Claude Code / Fable 5

Skills path: `.claude/skills/` (project) or `~/.claude/skills/` (global)
MCP config: `~/.claude/mcp.json` or project `.mcp.json`
Plugin marketplace: `/plugin marketplace add <repo>` then `/plugin install <name>`

### Opencode

Skills path: `.opencode/skills/` (project) or `~/.config/opencode/skills/` (global)
Also compatible with: `.claude/skills/`, `.agents/skills/`
MCP config: `opencode.json` — note: no native MCP support as of mid-2026, requires custom scripting
Plugin system: Add in `opencode.json` under `"plugin"` key

### Codex

Skills path: `.agents/skills/` (local) or `~/.agents/skills/` (global)
MCP config: `codex mcp add <name> -- npx -y <package>`

---

## 5. Quickstart: 5-Minute Startup Setup

```powershell
# 1. Install the mega-collection (136+ skills)
irm https://raw.githubusercontent.com/jshsakura/awesome-opencode-skills/main/install.ps1 | iex

# 2. Install core MCP servers (Claude Code)
claude mcp add github -- npx -y @github/mcp-server
claude mcp add filesystem -- npx -y @modelcontextprotocol/server-filesystem
claude mcp add postgres -- npx -y @anthropic/server-postgres
claude mcp add vercel -- npx -y @vercel/mcp
claude mcp add posthog -- npx -y @posthog/mcp
claude mcp add brave-search -- npx -y @anthropic/server-brave-search

# 3. Install Obra Superpowers for full dev methodology (opencode users)
# Add to opencode.json: { "plugin": ["superpowers@git+https://github.com/obra/superpowers.git"] }

# 4. Install UX skills
npx skills add https://github.com/nextlevelbuilder/ui-ux-pro-max-skill
npx skills add https://github.com/vercel-labs/agent-skills --skill web-design-guidelines
npx skills add https://github.com/vercel-labs/agent-skills --skill react-best-practices
```

---

## 6. Security Best Practices

| Rule | Detail |
|---|---|
| Never install 50 MCPs | 3-7 max. Each costs 2K-5K tokens per session |
| Pin versions | Avoid `latest` — pin to specific versions |
| Read-only first | Scope tokens to read-only until verified |
| Never production writes | Point agents at read replicas or staging |
| Trust no repo config | MCP `command` arrays from configs execute blindly — only open projects you trust in AI tools |
| Verify all security skills | The `security-reviewer` finds real issues — don't auto-merge its fixes without review |

---

## 7. Category Coverage Checklist

- [ ] **Frontend/UI-UX** — ui-ux-pro-max-skill, web-design-guidelines, react-best-practices, frontend-design
- [ ] **Backend** — backend-developer, api-designer, fullstack-developer
- [ ] **Testing** — testing-typescript-vitest, playwright-mcp, tdd skill
- [ ] **Security** — security-reviewer, penetration-tester, secure-code-guardian, secops-blueprint
- [ ] **Database** — postgres-mcp, supabase-mcp, redis-mcp
- [ ] **DevOps** — vercel-mcp, cloudflare-mcp, docker-mcp, sentry-mcp
- [ ] **Project Mgmt** — github-mcp, linear-mcp, slack-mcp, notion-mcp
- [ ] **Analytics** — posthog-mcp, brave-search, exa-mcp
- [ ] **AI/Data** — data-scientist, data-analyst, deep-research
- [ ] **Docs** — ai-writing-auditor, changelog-generator, docx/pdf/pptx
- [ ] **Payments** — stripe-mcp
- [ ] **Methodology** — obra-superpowers (TDD, plans, review, debug)
