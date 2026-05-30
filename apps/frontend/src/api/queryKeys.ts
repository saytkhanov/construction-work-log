import type { WorkLogFilters } from './workLogs';

export const queryKeys = {
  workTypes: ['work-types'] as const,
  workLogs: (filters: WorkLogFilters = {}) => ['work-logs', filters] as const,
};
