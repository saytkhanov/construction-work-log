import { apiClient } from './client';
import type { CreateWorkLogPayload, UpdateWorkLogPayload, WorkLog } from '../types';

export interface WorkLogFilters {
  workTypeId?: number;
  dateFrom?: string;
  dateTo?: string;
}

function buildQuery(filters: WorkLogFilters): string {
  const params = new URLSearchParams();
  if (filters.workTypeId) params.set('workTypeId', String(filters.workTypeId));
  if (filters.dateFrom) params.set('dateFrom', filters.dateFrom);
  if (filters.dateTo) params.set('dateTo', filters.dateTo);
  const query = params.toString();
  return query ? `?${query}` : '';
}

export const workLogsApi = {
  list: (filters: WorkLogFilters = {}) =>
    apiClient.get<WorkLog[]>(`/work-logs${buildQuery(filters)}`),
  create: (payload: CreateWorkLogPayload) => apiClient.post<WorkLog>('/work-logs', payload),
  update: (id: number, payload: UpdateWorkLogPayload) =>
    apiClient.patch<WorkLog>(`/work-logs/${id}`, payload),
  remove: (id: number) => apiClient.delete<void>(`/work-logs/${id}`),
};
