# CLAUDE.md — Token-Optimized for Zunoora Desktop

## Context
- Project: Electron + React + TypeScript + Supabase desktop app for Uzbek teacher docs
- See `.opencode/AGENTS.md` for full project context (read once, not each session)
- Design system in `SKILL.md` (monochrome, zn-* Tailwind tokens)

## Config (saves tokens)
- `opencode.json` has compaction: auto + prune + 8000 reserved
- MCP: only Supabase enabled (disable others to save 2K-5K each)
- Skills path: `/home/alexy/.config/opencode/skills` (130+ skills installed)

## Compact Rules
1. Run `/compact` at logical breakpoints. Start fresh after 3 compactions.
2. Prefer `grep`/`glob` → partial reads via `offset`+`limit`.
3. Route large output to files: `npm test > out.log 2>&1`
4. Don't re-read files already in context.
5. Keep AGENTS.md under 500 words (every word is a per-session tax).
6. Batch independent tool calls in parallel.
7. Use `todowrite` instead of verbose status updates.
8. Store decisions in memory files, don't re-explain them.

## Quick Links
- `.opencode/AGENTS.md` — full project structure & DB schema
- `SKILL.md` — brand design system (colors, typography, components)
- `opencode.json` — compaction & MCP config
- `/home/alexy/.config/opencode/skills/` — 130+ installed skills
