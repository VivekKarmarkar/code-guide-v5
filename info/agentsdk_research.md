# Claude Agent SDK — Research Findings

Research conducted by a swarm of 4 agents on 2026-03-14, sourcing ONLY from official Anthropic documentation.

---

## Key Discovery: Package Rename

The `@anthropic-ai/claude-code` npm package has been **renamed** to `@anthropic-ai/claude-agent-sdk` (the "Claude Agent SDK"). The old package is deprecated. Available in both **TypeScript** and **Python**.

---

## Three Ways to Use Claude Code Programmatically

### 1. Claude Agent SDK (Primary — Recommended for Our Project)

- **TypeScript:** `npm install @anthropic-ai/claude-agent-sdk` (Node.js 18+)
- **Python:** `pip install claude-agent-sdk` (Python 3.10+)
- Core API is the `query()` function — streams messages as an async generator
- Gives you all built-in tools (Read, Write, Edit, Bash, Glob, Grep, WebSearch, WebFetch, etc.)
- Supports subagents, hooks, MCP servers, sessions, permissions, structured output

**TypeScript example:**
```typescript
import { query } from "@anthropic-ai/claude-agent-sdk";

for await (const message of query({
  prompt: "Find and fix the bug in auth.py",
  options: { allowedTools: ["Read", "Edit", "Bash"] }
})) {
  console.log(message);
}
```

**Python example:**
```python
import asyncio
from claude_agent_sdk import query, ClaudeAgentOptions

async def main():
    async for message in query(
        prompt="Find and fix the bug in auth.py",
        options=ClaudeAgentOptions(allowed_tools=["Read", "Edit", "Bash"]),
    ):
        print(message)

asyncio.run(main())
```

**Key `query()` options:**

| Property | Type | Description |
|----------|------|-------------|
| `allowedTools` | `string[]` | Tools to auto-approve |
| `disallowedTools` | `string[]` | Tools to always deny |
| `permissionMode` | `string` | `default`, `acceptEdits`, `bypassPermissions`, `plan`, `dontAsk` |
| `canUseTool` | callback | Custom permission function |
| `model` | `string` | Claude model to use |
| `cwd` | `string` | Working directory |
| `systemPrompt` | `string` | System prompt |
| `maxTurns` | `number` | Max agentic turns |
| `maxBudgetUsd` | `number` | Budget cap |
| `agents` | `Record` | Define subagents |
| `mcpServers` | `Record` | MCP server configs |
| `hooks` | `Record` | Hook callbacks |
| `resume` | `string` | Session ID to resume |
| `outputFormat` | `object` | Structured JSON output with schema |
| `effort` | `string` | `low`, `medium`, `high`, `max` |
| `abortController` | `AbortController` | Cancellation |

**Message types streamed from `query()`:**
- `SDKAssistantMessage` — Assistant responses
- `SDKUserMessage` — User input
- `SDKResultMessage` — Final result with `result`, `total_cost_usd`, `usage`, `duration_ms`, `num_turns`, `structured_output`
- `SDKSystemMessage` — Init message with `session_id`, tools, model
- `SDKPartialAssistantMessage` — Streaming events (when `includePartialMessages: true`)
- `SDKStatusMessage`, `SDKHookStartedMessage`, `SDKHookResponseMessage`
- `SDKTaskNotificationMessage`, `SDKRateLimitEvent`

**Query object methods:**
- `interrupt()` — Interrupt the query
- `rewindFiles(userMessageId)` — Restore files to earlier state
- `setPermissionMode(mode)` — Change permission mode mid-query
- `setModel(model)` — Change model mid-query
- `streamInput(stream)` — Multi-turn streaming input
- `close()` — Terminate

**Session resumption:**
```typescript
let sessionId: string;
for await (const message of query({ prompt: "Read the auth module", options: { allowedTools: ["Read", "Glob"] } })) {
  if (message.type === "system" && message.subtype === "init") sessionId = message.session_id;
}
for await (const message of query({ prompt: "Now find all places that call it", options: { resume: sessionId } })) {
  if ("result" in message) console.log(message.result);
}
```

**Custom MCP tools (in-process):**
```typescript
import { query, tool, createSdkMcpServer } from "@anthropic-ai/claude-agent-sdk";
```

---

### 2. CLI Non-Interactive Mode (`--print`)

`claude -p "prompt"` runs in non-interactive mode, prints result and exits.

**Piping input:**
```bash
cat file | claude -p "query"
gh pr diff "$1" | claude -p --append-system-prompt "Review for vulnerabilities." --output-format json
```

**Output formats:**
- `text` (default): plain text
- `json`: structured JSON with result, session ID, metadata
- `stream-json`: newline-delimited JSON for real-time streaming

**Structured output with schema:**
```bash
claude -p "Extract function names from auth.py" \
  --output-format json \
  --json-schema '{"type":"object","properties":{"functions":{"type":"array","items":{"type":"string"}}},"required":["functions"]}'
```

**Key automation flags:**

| Flag | Description |
|------|-------------|
| `--print`, `-p` | Non-interactive mode |
| `--output-format` | `text`, `json`, or `stream-json` |
| `--json-schema` | Validated JSON output matching a schema |
| `--allowedTools` | Auto-approve specific tools |
| `--disallowedTools` | Block specific tools |
| `--permission-mode` | `default`, `plan`, `acceptEdits`, `bypassPermissions` |
| `--dangerously-skip-permissions` | Skip ALL permission prompts |
| `--permission-prompt-tool` | MCP tool to handle permissions in non-interactive mode |
| `--max-turns` | Limit agentic turns |
| `--max-budget-usd` | Budget cap |
| `--model` | Set model (`sonnet`, `opus`, or full ID) |
| `--fallback-model` | Auto-fallback when default overloaded |
| `--append-system-prompt` | Add custom instructions |
| `--system-prompt` | Replace entire system prompt |
| `--continue`, `-c` | Continue most recent conversation |
| `--resume`, `-r` | Resume specific session by ID |
| `--mcp-config` | Load MCP servers from JSON |
| `--cwd` | Set working directory |
| `--verbose` | Full turn-by-turn output |
| `--input-format` | `text` or `stream-json` |

**Permission evaluation order:**
1. Hooks (can allow, deny, or continue)
2. Deny rules (`disallowedTools`)
3. Permission mode
4. Allow rules (`allowedTools`)
5. `canUseTool` callback

---

### 3. GitHub Action (CI/CD)

**`anthropics/claude-code-action@v1`**

```yaml
- uses: anthropics/claude-code-action@v1
  with:
    anthropic_api_key: ${{ secrets.ANTHROPIC_API_KEY }}
    prompt: "Review this pull request"
    claude_args: "--max-turns 5 --model claude-sonnet-4-6"
```

Also supports GitLab CI/CD (beta).

---

## Subagents & Multi-Agent Patterns

### Built-in subagent types:
- **Explore** — Read-only, runs on Haiku, codebase search/analysis
- **Plan** — Read-only, gathers context before presenting plan
- **General-purpose** — Full tool access, complex multi-step tasks
- **Bash** — Terminal commands in separate context

### Custom agents (`.claude/agents/` directory):

YAML frontmatter fields:

| Field | Required | Description |
|-------|----------|-------------|
| `name` | Yes | Unique identifier |
| `description` | Yes | When to delegate to this agent |
| `tools` | No | Allowed tools |
| `model` | No | `sonnet`, `opus`, `haiku`, `inherit` |
| `permissionMode` | No | Permission behavior |
| `maxTurns` | No | Max turns |
| `mcpServers` | No | MCP servers for this agent |
| `hooks` | No | Lifecycle hooks |
| `memory` | No | Persistent memory scope |
| `isolation` | No | `worktree` for git isolation |

### Programmatic subagent definition:
```python
agents={
    "code-reviewer": AgentDefinition(
        description="Expert code reviewer.",
        prompt="You are a code review specialist...",
        tools=["Read", "Grep", "Glob"],
        model="sonnet",
    )
}
```

**Key constraint:** Subagents CANNOT spawn other subagents.

### Agent Teams (Experimental):
- Enable with `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1`
- Teammates are fully independent Claude Code instances
- Shared task list, direct inter-agent messaging
- No SDK programmatic interface for teams yet (CLI-interactive only)

---

## Hook System

Available hook events: `PreToolUse`, `PostToolUse`, `PostToolUseFailure`, `Notification`, `UserPromptSubmit`, `SessionStart`, `SessionEnd`, `Stop`, `SubagentStart`, `SubagentStop`, `PreCompact`, `PermissionRequest`, `Setup`, `TeammateIdle`, `TaskCompleted`, `ConfigChange`, `WorktreeCreate`, `WorktreeRemove`

---

## Official Demo Projects

**`claude-agent-sdk-demos`** (https://github.com/anthropics/claude-agent-sdk-demos) — 8 demos:
1. Email Agent — IMAP email assistant
2. Excel Demo — Spreadsheet manipulation
3. Hello World — Basic getting-started
4. Hello World V2 — V2 Session API with send()/stream()
5. Research Agent — Multi-agent parallel research
6. AskUserQuestion Previews — HTML preview cards via WebSocket
7. Simple Chat App — React + Express chat UI
8. Resume Generator — Web-search powered .docx generation

---

## Real-World Integration: Apple Xcode

Xcode 26.3 has native Claude Agent SDK integration:
- Visual feedback loop with Xcode Previews
- Architectural understanding of project structure
- Autonomous task decomposition
- Apple API documentation access

Source: https://www.anthropic.com/news/apple-xcode-claude-agent-sdk

---

## Engineering Blog Posts

- **"Building Agents with the Claude Agent SDK"** — Agent loop architecture, context management, verification patterns
  Source: https://claude.com/blog/building-agents-with-the-claude-agent-sdk
- **"Effective Harnesses for Long-Running Agents"** — Two-component architecture, incremental work with git commits
  Source: https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents

---

## All Official Source URLs

| Resource | URL |
|----------|-----|
| SDK Overview | https://platform.claude.com/docs/en/agent-sdk/overview |
| TypeScript Reference | https://platform.claude.com/docs/en/agent-sdk/typescript |
| Python SDK GitHub | https://github.com/anthropics/claude-agent-sdk-python |
| TypeScript SDK GitHub | https://github.com/anthropics/claude-agent-sdk-typescript |
| npm (new) | https://www.npmjs.com/package/@anthropic-ai/claude-agent-sdk |
| npm (old, deprecated) | https://www.npmjs.com/package/@anthropic-ai/claude-code |
| Demo Projects | https://github.com/anthropics/claude-agent-sdk-demos |
| CLI Headless Mode | https://code.claude.com/docs/en/headless |
| CLI Reference | https://code.claude.com/docs/en/cli-reference |
| Subagents | https://code.claude.com/docs/en/sub-agents |
| Permissions | https://platform.claude.com/docs/en/agent-sdk/permissions |
| GitHub Actions | https://code.claude.com/docs/en/github-actions |
| GitLab CI/CD | https://code.claude.com/docs/en/gitlab-ci-cd |
| Quickstart | https://platform.claude.com/docs/en/agent-sdk/quickstart |
| Hooks | https://platform.claude.com/docs/en/agent-sdk/hooks |
| MCP | https://platform.claude.com/docs/en/agent-sdk/mcp |
| Sessions | https://platform.claude.com/docs/en/agent-sdk/sessions |
| Custom Tools | https://platform.claude.com/docs/en/agent-sdk/custom-tools |
| Structured Outputs | https://platform.claude.com/docs/en/agent-sdk/structured-outputs |
| Apple Xcode Blog | https://www.anthropic.com/news/apple-xcode-claude-agent-sdk |
| Building Agents Blog | https://claude.com/blog/building-agents-with-the-claude-agent-sdk |
| Long-Running Agents Blog | https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents |
