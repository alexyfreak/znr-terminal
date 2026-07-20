# AI Agent Specification: Secure Custom Domain Deployment for Vite/TypeScript
**Target Repository:** https://github.com/alexyfreak/znr-terminal
**Target Domain:** zunoora.com
**Environment:** GitHub Pages (Static Deployment) + Custom Registrar DNS

---

## Phase 1: Execution Prerequisites & Security Safeguards
Before running commands, the AI agent must verify the structural conditions of the local workspace.

### 1.1 Integrity Checks
* Confirm that working tree state is clean (`git status`). Do not execute deployments on uncommitted work unless explicitly overridden.
* Validate that `package.json` exists in the execution root and contains a TypeScript project with a bundler config (`vite.config.ts`).

### 1.2 Isolation & Secure Dependency Mapping
* Execute package installations with the `--save-dev` flag to keep production bundles unpolluted.
* Ensure no private tokens, API keys, or raw text credentials exist within files that will compile into the static directory.

---

## Phase 2: Codebase & Automated Build Engineering

### 2.1 Router Realignment
The agent must open `vite.config.ts` (or `vite.config.js`) and modify the `base` property. Because the deployment targets a clean root domain (`zunoora.com`), routing paths must resolve directly from the domain root.
* **Action:** Update or inject the `base` parameter to `'/'`:
```typescript
import { defineConfig } from 'vite';
// ... other imports

export default defineConfig({
  base: '/', 
  // Ensure other existing configuration elements are entirely preserved
});