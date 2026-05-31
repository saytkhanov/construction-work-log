import { apiClient } from './client';
import type {
  CreateWorkLogEntryPayload,
  UpdateWorkLogEntryPayload,
  WorkLogEntry,
} from '../types/workLog';

export interface WorkLogEntriesFilters {
  workTypeId?: string;
  dateFrom?: string;
  dateTo?: string;
  sortOrder?: 'asc' | 'desc';
}

function buildQuery(filters: WorkLogEntriesFilters): string {
  const params = new URLSearchParams();
  if (filters.workTypeId) params.set('workTypeId', filters.workTypeId);
  if (filters.dateFrom) params.set('dateFrom', filters.dateFrom);
  if (filters.dateTo) params.set('dateTo', filters.dateTo);
  if (filters.sortOrder) params.set('sortOrder', filters.sortOrder);
  const query = params.toString();
  return query ? `?${query}` : '';
}

export const workLogEntriesApi = {
  list: (filters: WorkLogEntriesFilters = {}) =>
    apiClient.get<WorkLogEntry[]>(`/work-log-entries${buildQuery(filters)}`),
  create: (payload: CreateWorkLogEntryPayload) =>
    apiClient.post<WorkLogEntry>('/work-log-entries', payload),
  update: (id: string, payload: UpdateWorkLogEntryPayload) =>
    apiClient.patch<WorkLogEntry>(`/work-log-entries/${id}`, payload),
  remove: (id: string) => apiClient.delete<void>(`/work-log-entries/${id}`),
};
