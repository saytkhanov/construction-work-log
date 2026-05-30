import { z } from 'zod';

/** Распространённые единицы измерения для выпадающего списка. */
export const UNIT_OPTIONS = ['м³', 'м²', 'м', 'шт', 'п.м.', 'т', 'кг'] as const;

/**
 * Схема валидации формы записи журнала.
 * Работает со «сырыми» строковыми значениями из инпутов и проверяет их;
 * приведение объёма к числу делается в onSubmit, чтобы тип значений формы
 * был однородным (это упрощает интеграцию с react-hook-form).
 */
export const workLogFormSchema = z.object({
  date: z
    .string()
    .min(1, 'Укажите дату')
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Неверный формат даты'),
  workTypeId: z.string().min(1, 'Выберите вид работ'),
  volume: z
    .string()
    .min(1, 'Укажите объём')
    .refine((value) => {
      const parsed = Number(value.replace(',', '.'));
      return Number.isFinite(parsed) && parsed > 0;
    }, 'Объём должен быть числом больше 0'),
  unit: z.string().min(1, 'Выберите единицу измерения'),
  executorName: z.string().trim().min(1, 'Укажите исполнителя').max(200, 'Слишком длинное значение'),
  comment: z.string().trim().max(2000, 'Слишком длинное примечание').optional(),
});

export type WorkLogFormValues = z.infer<typeof workLogFormSchema>;
