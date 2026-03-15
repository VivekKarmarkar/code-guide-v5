# Design Choice: Why Claude Code Programmatically

## The Core Question

What can ONLY be done with Claude Code that can't be done by simply calling the Anthropic API in a custom agentic loop?

## The Honest Answer

Technically, nothing. Claude Code is fundamentally an agentic loop on top of the Anthropic API. Everything it does — file editing, bash execution, search, subagents — you *could* build yourself with the raw API and tool use.

## What Claude Code Gives You That's Hard to Replicate Well

- **A battle-tested system prompt** tuned for coding tasks
- **Refined tool definitions** (edit, glob, grep, etc.) that took significant iteration to get right
- **Context management** — automatic compaction, conversation history handling
- **Permission/safety layers** — sandboxing, user approval flows
- **CLAUDE.md project context** loading
- **Hooks and MCP integrations** already wired up

## Why Claude Code Programmatically Is the Right Choice for This Project

The core task — "agentically scan a codebase and construct understanding" — is *exactly* what Claude Code already does well. It already has:

- **File traversal tools** (Glob, Grep, Read, LS) that are refined and battle-tested
- **The intelligence to navigate a codebase non-linearly** — it doesn't just read top to bottom, it follows imports, traces call chains, jumps between layers
- **Context management** — it knows when to compact, when to go deeper, when to spawn subagents for parallel exploration
- **The system prompt and tool definitions** that make Claude behave as a code-understanding agent, not just a text-completion model

## The Decisive Argument

The software's core intelligence layer IS codebase exploration, and Claude Code is already the best existing implementation of that capability. Building it from scratch on the raw API would mean rebuilding Claude Code with extra steps.

If you built your own loop on the raw API, you'd spend significant time **recreating the exact exploration behavior that Claude Code already has** — the same tool definitions, the same heuristics for when to search vs. read vs. explore deeper.

## When NOT to Use Claude Code (For Reference)

- If the app needs fundamentally different tools
- If the app needs a different safety model
- If the app needs a fundamentally different interaction pattern

This project needs none of those exceptions — it needs exactly what Claude Code already does, wrapped in a UI with visual output.
