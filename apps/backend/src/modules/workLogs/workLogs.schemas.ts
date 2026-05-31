import { z } from 'zod';

/** YYYY-MM-DD */
const dateString = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format')
  .refine((value) => !Number.isNaN(Date.parse(value)), 'Invalid calendar date');

const id = z.string().min(1, 'Id is required');

export const createWorkLogSchema = z.object({
  date: dateString,
  workTypeId: id,
  volume: z.coerce
    .number({ invalid_type_error: 'Volume must be a number' })
    .positive('Volume must be greater than 0')
    .max(9_999_999_999, 'Volume is too large'),
  unit: z.string().trim().min(1, 'Unit is required').max(16),
  executorName: z.string().trim().min(2, 'Executor name must be at least 2 characters').max(200),
  comment: z.string().trim().max(2000).optional().or(z.literal('')),
});

// Все поля опциональны при обновлении, но хотя бы одно должно присутствовать.
export const updateWorkLogSchema = createWorkLogSchema.partial().refine(
  (data) => Object.keys(data).length > 0,
  { message: 'At least one field must be provided' },
);

export const workLogIdParamSchema = z.object({
  id,
});

export const listWorkLogsQuerySchema = z.object({
  workTypeId: id.optional(),
  dateFrom: dateString.optional(),
  dateTo: dateString.optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export type CreateWorkLogInput = z.infer<typeof createWorkLogSchema>;
export type UpdateWorkLogInput = z.infer<typeof updateWorkLogSchema>;
export type ListWorkLogsQuery = z.infer<typeof listWorkLogsQuerySchema>;
