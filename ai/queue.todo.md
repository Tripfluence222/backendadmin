# Task Queue

## Active Tasks
- [ ] #Q-002 Implement schedule-page discovery heuristics & provider detection  
- [ ] #Q-003 Implement GenericHeuristicParser confidence scoring + filtering by TARGET_MONTH
- [ ] #Q-004 Add auto-adapter registry + persistence
- [ ] #Q-005 Export CSV + ICS + review.jsonl; save snapshots
- [ ] #Q-006 Add logs & per-site summary; update README

## Completed Tasks
- [x] #Q-001 Add job src/jobs/runFromList.ts to read data/yoga_centers_bali.csv and enqueue sites

## Blocked Tasks
<!-- Tasks waiting on decisions or external dependencies -->

## Notes
- Priority: Focus on yoga center data pipeline
- Target month filtering: configurable via environment
- Confidence scoring: 0-1 scale for parser accuracy