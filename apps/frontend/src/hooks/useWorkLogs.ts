import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { workLogsApi, type WorkLogFilters } from '../api/workLogs';
import { queryKeys } from '../api/queryKeys';
import type { CreateWorkLogPayload, UpdateWorkLogPayload } from '../types';

export function useWorkLogs(filters: WorkLogFilters = {}) {
  return useQuery({
    queryKey: queryKeys.workLogs(filters),
    queryFn: () => workLogsApi.list(filters),
  });
}

export function useCreateWorkLog() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateWorkLogPayload) => workLogsApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['work-logs'] });
    },
  });
}

export function useUpdateWorkLog() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateWorkLogPayload }) =>
      workLogsApi.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['work-logs'] });
    },
  });
}

export function useDeleteWorkLog() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => workLogsApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['work-logs'] });
    },
  });
}
