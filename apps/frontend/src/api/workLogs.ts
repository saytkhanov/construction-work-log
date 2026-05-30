import { apiClient } from './client';
import type { CreateWorkLogPayload, UpdateWorkLogPayload, WorkLogEntry } from '../types';

export interface WorkLogFilters {
  workTypeId?: string;
  dateFrom?: string;
  dateTo?: string;
}

function buildQuery(filters: WorkLogFilters): string {
  const params = new URLSearchParams();
  if (filters.workTypeId) params.set('workTypeId', filters.workTypeId);
  if (filters.dateFrom) params.set('dateFrom', filters.dateFrom);
  if (filters.dateTo) params.set('dateTo', filters.dateTo);
  const query = params.toString();
  return query ? `?${query}` : '';
}

export const workLogsApi = {
  list: (filters: WorkLogFilters = {}) =>
    apiClient.get<WorkLogEntry[]>(`/work-logs${buildQuery(filters)}`),
  create: (payload: CreateWorkLogPayload) => apiClient.post<WorkLogEntry>('/work-logs', payload),
  update: (id: string, payload: UpdateWorkLogPayload) =>
    apiClient.patch<WorkLogEntry>(`/work-logs/${id}`, payload),
  remove: (id: string) => apiClient.delete<void>(`/work-logs/${id}`),
};
