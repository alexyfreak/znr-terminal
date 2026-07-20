# CLAUDE.md — Token-Optimized Template

## Context Management
- Manage context aggressively. Run `/compact` manually at logical breakpoints.
- Keep CLAUDE.md under 400 words (every word is a per-session tax).
- Start fresh sessions per major task; do not extend past 3 auto-compactions.
- Prefer `grep`/`glob` over full file reads. Use `offset`+`limit` for partial reads.
- Route large command outputs to files, not context: `npm test > out.log`
- Store decisions in memory files instead of re-explaining them.

## Compact Instructions
When compacting, preserve in structured format: files modified, key decisions, error messages, function signatures, pending tasks, and test results. Use explicit section headings — structure forces preservation.

## Do NOT
- Keep more than 7 MCP servers enabled (each costs 2K-5K tokens)
- Re-read a file you already have in context
- Keep verbose command output after it's served its purpose
- Let sessions run past 3 compactions without a fresh restart
