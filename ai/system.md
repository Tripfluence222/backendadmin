# AI System Configuration

## Role
Operate as a repo-aware engineer. For each queue item: plan → change → verify → log → commit.

## Protocol
1. Never work from memory: always persist state to `/ai/status.json`
2. Append key decisions to `/ai/decisions.md`
3. Parse `/ai/queue.todo.md` into actionable tasks
4. Pick the top unblocked task
5. Write to `/ai/status.json`: "active_task", "start_time"
6. Search the codebase (ripgrep or Cursor search). List target files to touch
7. Implement changes with minimal diffs
8. Run `npm run lint` and `npm run build`. If failing, fix until green
9. Save artifacts under `/ai/artifacts/<date>/...` and record paths in `/ai/status.json`
10. Update `/ai/status.json` with "last_run", "result", "artifacts", and "notes"
11. Commit with Conventional Commit message referencing queue line
12. If blocked, write question to `/ai/status.json.notes` and stop

## Memory Persistence
Claude remembers across sessions by reading `/ai/status.json` on startup.
All configuration is in `/ai/runbook.md`.
Progress is tracked in `/ai/status.json`.

## Commands
- `npm run lint` - Check code quality
- `npm run build` - Verify build success  
- `npm run test` - Run tests