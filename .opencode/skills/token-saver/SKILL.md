---
name: token-saver
description: Use when the user wants to save tokens, compact context, optimize context window, reduce token usage, manage session length, or any task involving opencode/claude context budgeting. Apply these rules proactively during any coding session.
---

# Token Saver — Context Optimization

## Before Starting
- Check `opencode.json` compaction settings are enabled (auto: true, prune: true, reserved ≥ 8000)
- Check `.opencode/AGENTS.md` exists for project context (prevents re-discovery)
- Route `npm test`, `npm run build`, `npm run lint`, `npx tsc --noEmit` output to files: `cmd > out.log 2>&1`

## During Session
- Prefer `grep`/`glob` over full file reads. Use `offset`+`limit` for partial reads.
- Don't re-read files already in context. Re-use prior reads.
- Batch independent tool calls in parallel (avoids token waste on sequential roundtrips).
- After any large command output, summarize the outcome in 1-2 lines rather than keeping raw output in context.
- Store non-critical decisions in memory/log files instead of verbose re-explanations.

## At Breaks
- Run `/compact` manually at logical breakpoints (after a feature is done).
- If 3+ compactions have occurred, consider starting a fresh session.

## Design Trade-offs
- Every word in system prompt/instructions is a per-session tax. Keep AGENTS.md under 500 lines.
- Each enabled MCP server costs 2K–5K tokens. Disable any server not needed for the current task.
- Prefer multiple focused agent calls over one long-running chat. Start fresh per major task.
- Use `todowrite` to track progress instead of verbose status updates in chat.
