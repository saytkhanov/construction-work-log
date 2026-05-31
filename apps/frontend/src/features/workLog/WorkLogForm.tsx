import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  UNIT_OPTIONS,
  workLogFormSchema,
  type WorkLogFormValues,
} from './workLogForm.schema';
import { useWorkTypes } from '../../hooks/useWorkTypes';
import { useCreateWorkLogEntry } from '../../hooks/useWorkLogEntries';
import { ApiError } from '../../api/client';
import styles from './WorkLogForm.module.css';

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

const emptyValues: WorkLogFormValues = {
  date: today(),
  workTypeId: '',
  volume: '',
  unit: '',
  executorName: '',
  comment: '',
};

export function WorkLogForm() {
  const { data: workTypes, isLoading: workTypesLoading } = useWorkTypes();
  const createWorkLog = useCreateWorkLogEntry();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<WorkLogFormValues>({
    resolver: zodResolver(workLogFormSchema),
    defaultValues: emptyValues,
  });

  const onSubmit = handleSubmit(async (values) => {
    await createWorkLog.mutateAsync({
      date: values.date,
      workTypeId: values.workTypeId,
      volume: Number(values.volume.replace(',', '.')),
      unit: values.unit,
      executorName: values.executorName,
      comment: values.comment || undefined,
    });
    reset({ ...emptyValues, date: values.date });
  });

  return (
    <form className={styles.form} onSubmit={onSubmit} noValidate>
      <h2 className={styles.title}>Новая запись</h2>

      <div className={styles.grid}>
        <label className={styles.field}>
          <span className={styles.label}>Дата</span>
          <input type="date" {...register('date')} className={styles.input} />
          {errors.date && <span className={styles.error}>{errors.date.message}</span>}
        </label>

        <label className={styles.field}>
          <span className={styles.label}>Вид работ</span>
          <select {...register('workTypeId')} className={styles.input} disabled={workTypesLoading}>
            <option value="">— выберите —</option>
            {workTypes?.map((workType) => (
              <option key={workType.id} value={workType.id}>
                {workType.name}
              </option>
            ))}
          </select>
          {errors.workTypeId && <span className={styles.error}>{errors.workTypeId.message}</span>}
        </label>

        <label className={styles.field}>
          <span className={styles.label}>Объём</span>
          <input
            type="text"
            inputMode="decimal"
            placeholder="например, 12.5"
            {...register('volume')}
            className={styles.input}
          />
          {errors.volume && <span className={styles.error}>{errors.volume.message}</span>}
        </label>

        <label className={styles.field}>
          <span className={styles.label}>Ед. изм.</span>
          <select {...register('unit')} className={styles.input}>
            <option value="">— выберите —</option>
            {UNIT_OPTIONS.map((unit) => (
              <option key={unit} value={unit}>
                {unit}
              </option>
            ))}
          </select>
          {errors.unit && <span className={styles.error}>{errors.unit.message}</span>}
        </label>

        <label className={styles.field}>
          <span className={styles.label}>Исполнитель</span>
          <input
            type="text"
            placeholder="Бригада / ответственный"
            {...register('executorName')}
            className={styles.input}
          />
          {errors.executorName && <span className={styles.error}>{errors.executorName.message}</span>}
        </label>

        <label className={`${styles.field} ${styles.fieldWide}`}>
          <span className={styles.label}>Примечание</span>
          <textarea
            rows={2}
            placeholder="Необязательно"
            {...register('comment')}
            className={styles.input}
          />
          {errors.comment && <span className={styles.error}>{errors.comment.message}</span>}
        </label>
      </div>

      {createWorkLog.isError && (
        <p className={styles.submitError}>
          {createWorkLog.error instanceof ApiError
            ? createWorkLog.error.message
            : 'Не удалось сохранить запись'}
        </p>
      )}

      <button type="submit" className={styles.submit} disabled={isSubmitting}>
        {isSubmitting ? 'Сохранение…' : 'Добавить запись'}
      </button>
    </form>
  );
}
