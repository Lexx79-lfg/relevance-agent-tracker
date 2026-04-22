# Relevance Agent Project Guide

## What This Is
Relevance Agent is a personal AI mentor system that helps users stay aligned with what matters most.

It combines:
- regulation
- direction
- step-by-step execution
- growth support
- reward and milestone feedback

This is not just a productivity app. It is a calm mentorship layer for people who may feel overwhelmed, stuck, dysregulated, or alone in decision-making.

## Current Product Goal
Build the smallest usable prototype first: a simple mentor loop that helps the user choose a mission, get regulated, take one clear next action, log progress, and receive encouraging feedback.

The current app should stay simple, local, and easy to understand.

## Mentor Modes
The product should support four mentor modes:

- Regulation: calm the user first when they are overwhelmed, anxious, scattered, or emotionally activated.
- Execution: help the user take the next concrete step and complete small actions.
- Strategy: help the user think clearly, prioritize, and choose a plan.
- Partner/Parent: support communication, patience, repair, and shared responsibility in close relationships.

## Experience Rules
- Prioritize calm, clarity, and low cognitive load.
- Use simple step-by-step flows.
- Avoid overwhelming the user with too many choices at once.
- Prefer encouragement, grounding, and momentum over pressure.
- Completion matters more than perfection.
- Preserve the feeling that the user is guided, not judged.

## Prototype Rules
- Build the smallest usable prototype first.
- Keep the app local for now.
- Prefer local state and `localStorage`.
- Do not add a backend, auth, or database unless explicitly requested.
- Do not add accounts, sync, analytics, or complex settings yet.
- Do not build large systems before the basic mentor loop works.

## Coding Guidance
- Keep components small, readable, and beginner-friendly.
- Avoid unnecessary abstractions, dependencies, and cleverness.
- Prefer clear names and straightforward data flow.
- Keep state close to where it is used unless there is a real need to extract it.
- Avoid broad refactors when a small change is enough.
- Preserve existing behavior unless the task explicitly asks to change it.
- Make UI changes in small, verifiable steps.

## Open Notes
- `docs/mentor-system.md` and `docs/experience-design.md` are currently empty, so product direction should come from `docs/product-vision.md` and explicit task instructions until those docs are filled in.
