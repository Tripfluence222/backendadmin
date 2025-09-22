# AI Engineering Decisions Log

## 2025-09-22: System Bootstrap
- **Decision**: Created AI system with persistent state in `/ai/` directory
- **Rationale**: Enable Claude to maintain context across sessions via file-based memory
- **Impact**: Claude can resume work exactly where it left off by reading `/ai/status.json`

## File Structure Decisions
- **Status**: `/ai/status.json` for current task state
- **Queue**: `/ai/queue.todo.md` for task management  
- **Runbook**: `/ai/runbook.md` for workflow documentation
- **Artifacts**: `/ai/artifacts/<date>/` for preserving logs/screenshots
- **Decisions**: This file for architectural choices

## Protocol Decisions
- **Commit Format**: Conventional Commits with queue reference (e.g., `feat(parser): add momoyoga adapter #Q-017`)
- **Verification**: Must pass `npm run lint` and `npm run build` before commit
- **Artifacts**: All debugging materials saved and referenced in status
- **Blocking**: Write questions to status.notes instead of proceeding with unknowns

## Q-001 Implementation Decisions
- **CSV Location**: Placed in `/data/` directory for easy access and organization
- **Job Location**: Created in `/src/jobs/` to separate from main queue infrastructure in `/jobs/`
- **Interface Design**: Used flexible processor interface to allow different queue backends
- **Error Handling**: Included validation, logging, and graceful error recovery
- **TypeScript**: Fixed import issues and type assertions for CSV parsing
- **Testing**: Used console processor for immediate verification without queue dependencies