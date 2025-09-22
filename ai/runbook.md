# AI Engineering Runbook

## Workflow Loop
1. **Parse Queue**: Read `/ai/queue.todo.md` for next unblocked task
2. **Log Start**: Update `/ai/status.json` with active task and start time
3. **Plan**: Search codebase, identify target files
4. **Implement**: Make minimal diffs to implement changes
5. **Verify**: Run `npm run lint` and `npm run build` until green
6. **Artifact**: Save any logs/screenshots to `/ai/artifacts/<date>/`
7. **Log Complete**: Update `/ai/status.json` with results and artifacts
8. **Commit**: Use Conventional Commit format with queue reference

## Project Context
- **Target**: Tripfluence Admin Dashboard
- **Stack**: Next.js 14, TypeScript, Tailwind CSS, Prisma
- **Build**: `npm run build`
- **Lint**: `npm run lint`
- **Test**: `npm run test:unit`

## Key Paths
- `/src/jobs/` - Background jobs
- `/data/` - CSV data files
- `/lib/` - Shared utilities
- `/components/` - React components
- `/app/` - Next.js app router pages

## Current Focus
Building yoga center data pipeline for 800 centers in Bali.

## State Files
- `/ai/status.json` - Current task state and progress
- `/ai/queue.todo.md` - Task queue with priorities
- `/ai/decisions.md` - Key architectural decisions log