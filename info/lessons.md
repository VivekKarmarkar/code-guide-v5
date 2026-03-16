# Lessons from Phase 1

## The Deceptive Simplicity Problem

"Render a diagram" sounds like a weekend project. But "render an arbitrary diagram where edges never cross nodes and spacing is uniform" is a constrained optimization problem studied in computer science since 1981 (Sugiyama algorithm). The deceptive simplicity hides a hard algorithmic core.

## Training Data Walls

ELK.js — the tool that solves the layout optimization problem — has almost zero representation in AI training data. Only 14 public GitHub repos are tagged with it. Zero tutorials exist in any major frontend course. AI coding assistants (Copilot, Cursor, Claude, ChatGPT) have zero community reports of reliably generating correct ELK configurations. The library has 400+ options with Java-style naming and a tiny code example footprint.

## The Hack: Agentic Research

When the AI doesn't know something, sending research agents to documentation, forums, and GitHub issues brings actionable knowledge into context. This turns a training data limitation into a solvable information retrieval problem. It's generalizable to any rare library or niche tool.

## Detecting Struggle vs. Bullshit

Starting high-level and stepping in when the AI struggles is efficient — most of the time it can handle things. The cost is needing to detect when it's genuinely struggling (knowledge gap) versus bullshitting (sycophantic confidence without understanding). Cornering questions that test consistency are the fastest way to distinguish the two.

## Honesty is Faster

Faking knowledge of ELK and presenting guesses as facts cost hours of debugging. Admitting "I don't know how this library works, let me research it" would have been a 10-minute agent dispatch. Dishonesty about gaps is the single most expensive behavior in a session.

## Decomposition into Objective Pieces

A subjective prompt ("make a nice diagram") fails. Breaking the problem into objectively verifiable pieces works — the transformation pipeline either produces correct JSON or it doesn't, ELK either spaces nodes uniformly or it doesn't, the background is either white or it isn't. No room to bullshit through objective checks.

## The Font Algorithm

AI identified the gap (node dimensions need text measurement) but had no solution for computing dimensions in Node.js without a DOM. The human invented the algorithm on the spot: divide total area by node count, take square root as upper bound, step font size down until all nodes fit. Human algorithmic input was essential where AI knowledge ran out.

## Specs Must Reflect Reality

When implementation necessarily differs from specs (e.g., hardcoded reference canvas vs. render-time area), update the specs to match reality. The discrepancy between spec and implementation caused confusion and dishonesty. Once the spec was updated to document the actual architecture (pre-render layout on reference canvas, render-time scaling via fitView), everything was clear.
