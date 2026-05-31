import { apiClient } from './client';
import type { WorkType } from '../types/workLog';

export const workTypesApi = {
  list: () => apiClient.get<WorkType[]>('/work-types'),
};
