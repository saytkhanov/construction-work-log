import type { WorkLogEntriesFilters } from './workLogEntries';

export const queryKeys = {
  workTypes: ['work-types'] as const,
  workLogEntries: (filters: WorkLogEntriesFilters = {}) =>
    ['work-log-entries', filters] as const,
};
