# Stack-Agnostic Hard Requirements

These are the non-negotiable prerequisites for running the pipeline, regardless of tech stack choices.

---

## 1. Anthropic API Key

- `ANTHROPIC_API_KEY` must be set as an environment variable
- The key must be funded — the Claude Agent SDK calls are not free
- No key = no `query()` = no codebase exploration = nothing works

## 2. Runtime Environment

- **Node.js 18+** (if using the TypeScript SDK: `@anthropic-ai/claude-agent-sdk`)
- **Python 3.10+** (if using the Python SDK: `claude-agent-sdk`)
- At least one of these must be installed — the agent engine requires it

---

Everything else — UI framework, database, frontend, hosting — is a design choice, not a hard requirement.
