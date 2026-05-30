import { z } from 'zod';

/** YYYY-MM-DD */
const dateString = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format')
  .refine((value) => !Number.isNaN(Date.parse(value)), 'Invalid calendar date');

export const createWorkLogSchema = z.object({
  date: dateString,
  workTypeId: z.coerce.number().int('Work type id must be an integer').positive(),
  volume: z.coerce
    .number({ invalid_type_error: 'Volume must be a number' })
    .positive('Volume must be greater than 0')
    .max(9_999_999_999, 'Volume is too large'),
  executor: z.string().trim().min(1, 'Executor is required').max(200),
  notes: z.string().trim().max(2000).optional().or(z.literal('')),
});

// Все поля опциональны при обновлении, но хотя бы одно должно присутствовать.
export const updateWorkLogSchema = createWorkLogSchema.partial().refine(
  (data) => Object.keys(data).length > 0,
  { message: 'At least one field must be provided' },
);

export const workLogIdParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export const listWorkLogsQuerySchema = z.object({
  workTypeId: z.coerce.number().int().positive().optional(),
  dateFrom: dateString.optional(),
  dateTo: dateString.optional(),
});

export type CreateWorkLogInput = z.infer<typeof createWorkLogSchema>;
export type UpdateWorkLogInput = z.infer<typeof updateWorkLogSchema>;
export type ListWorkLogsQuery = z.infer<typeof listWorkLogsQuerySchema>;
