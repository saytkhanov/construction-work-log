import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { workLogFormSchema, type WorkLogFormValues } from './workLogForm.schema';
import { useWorkTypes } from '../../hooks/useWorkTypes';
import { useCreateWorkLog } from '../../hooks/useWorkLogs';
import { ApiError } from '../../api/client';
import styles from './WorkLogForm.module.css';

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

export function WorkLogForm() {
  const { data: workTypes, isLoading: workTypesLoading } = useWorkTypes();
  const createWorkLog = useCreateWorkLog();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<WorkLogFormValues>({
    resolver: zodResolver(workLogFormSchema),
    defaultValues: { date: today(), workTypeId: '', volume: '', executor: '', notes: '' },
  });

  const onSubmit = handleSubmit(async (values) => {
    await createWorkLog.mutateAsync({
      date: values.date,
      workTypeId: Number(values.workTypeId),
      volume: Number(values.volume.replace(',', '.')),
      executor: values.executor,
      notes: values.notes || undefined,
    });
    reset({ date: values.date, workTypeId: '', volume: '', executor: '', notes: '' });
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
                {workType.name} ({workType.unit})
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
          <span className={styles.label}>Исполнитель</span>
          <input
            type="text"
            placeholder="Бригада / ответственный"
            {...register('executor')}
            className={styles.input}
          />
          {errors.executor && <span className={styles.error}>{errors.executor.message}</span>}
        </label>

        <label className={`${styles.field} ${styles.fieldWide}`}>
          <span className={styles.label}>Примечание</span>
          <textarea
            rows={2}
            placeholder="Необязательно"
            {...register('notes')}
            className={styles.input}
          />
          {errors.notes && <span className={styles.error}>{errors.notes.message}</span>}
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
