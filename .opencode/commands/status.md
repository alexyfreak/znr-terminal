---
description: Show token budget, compaction status, and context usage.
agent: general
---

Check the current project's token and context state:

1. Read `opencode.json` and report compaction settings (auto, prune, reserved)
2. Count lines in `.opencode/AGENTS.md` to verify it's under 500
3. List enabled MCP servers from `opencode.json`
4. Run `wc -c /home/alexy/.config/opencode/opencode.jsonc`
5. Suggest `/compact` if session is long
