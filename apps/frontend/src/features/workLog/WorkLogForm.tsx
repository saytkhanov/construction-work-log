import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  UNIT_OPTIONS,
  workLogFormSchema,
  type WorkLogFormValues,
} from './workLogForm.schema';
import { useWorkTypes } from '../../hooks/useWorkTypes';
import { useCreateWorkLogEntry, useUpdateWorkLogEntry } from '../../hooks/useWorkLogEntries';
import { ApiError } from '../../api/client';
import type { WorkLogEntry } from '../../types/workLog';
import styles from './WorkLogForm.module.css';

interface WorkLogFormProps {
  /** Если задано — форма работает в режиме редактирования этой записи. */
  editingEntry: WorkLogEntry | null;
  onCancelEdit: () => void;
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

function emptyValues(): WorkLogFormValues {
  return { date: today(), workTypeId: '', volume: '', unit: '', executorName: '', comment: '' };
}

function valuesFromEntry(entry: WorkLogEntry): WorkLogFormValues {
  return {
    date: entry.date.slice(0, 10),
    workTypeId: entry.workTypeId,
    volume: String(entry.volume),
    unit: entry.unit,
    executorName: entry.executorName,
    comment: entry.comment ?? '',
  };
}

export function WorkLogForm({ editingEntry, onCancelEdit }: WorkLogFormProps) {
  const { data: workTypes, isLoading: workTypesLoading } = useWorkTypes();
  const createEntry = useCreateWorkLogEntry();
  const updateEntry = useUpdateWorkLogEntry();

  const [success, setSuccess] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const isEditing = editingEntry !== null;
  const activeMutation = isEditing ? updateEntry : createEntry;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<WorkLogFormValues>({
    resolver: zodResolver(workLogFormSchema),
    defaultValues: emptyValues(),
  });

  // Синхронизируем поля формы с режимом: при входе в редактирование подставляем
  // значения записи и прокручиваем к форме; при выходе — очищаем форму.
  useEffect(() => {
    if (editingEntry) {
      reset(valuesFromEntry(editingEntry));
      setSuccess(null);
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      reset(emptyValues());
    }
  }, [editingEntry, reset]);

  const onSubmit = handleSubmit(async (values) => {
    setSuccess(null);
    const payload = {
      date: values.date,
      workTypeId: values.workTypeId,
      volume: Number(values.volume.replace(',', '.')),
      unit: values.unit,
      executorName: values.executorName,
      comment: values.comment || undefined,
    };

    if (editingEntry) {
      await updateEntry.mutateAsync({ id: editingEntry.id, payload });
      setSuccess('Изменения сохранены.');
      onCancelEdit();
    } else {
      await createEntry.mutateAsync(payload);
      setSuccess('Запись добавлена в журнал.');
      reset({ ...emptyValues(), date: values.date });
    }
  });

  const errorMessage = activeMutation.isError
    ? activeMutation.error instanceof ApiError
      ? activeMutation.error.message
      : 'Не удалось сохранить запись'
    : null;

  return (
    <form className={styles.form} onSubmit={onSubmit} noValidate ref={formRef}>
      <h2 className={styles.title}>{isEditing ? 'Редактирование записи' : 'Новая запись'}</h2>

      <div className={styles.grid}>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="date">
            Дата выполнения
          </label>
          <input id="date" type="date" {...register('date')} className={styles.input} />
          {errors.date && <span className={styles.error}>{errors.date.message}</span>}
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="workTypeId">
            Вид работ
          </label>
          <select
            id="workTypeId"
            {...register('workTypeId')}
            className={styles.input}
            disabled={workTypesLoading}
          >
            <option value="">— выберите —</option>
            {workTypes?.map((workType) => (
              <option key={workType.id} value={workType.id}>
                {workType.name}
              </option>
            ))}
          </select>
          {errors.workTypeId && <span className={styles.error}>{errors.workTypeId.message}</span>}
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="volume">
            Объём
          </label>
          <input
            id="volume"
            type="number"
            min="0"
            step="any"
            inputMode="decimal"
            placeholder="например, 24"
            {...register('volume')}
            className={styles.input}
          />
          {errors.volume && <span className={styles.error}>{errors.volume.message}</span>}
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="unit">
            Единица измерения
          </label>
          <select id="unit" {...register('unit')} className={styles.input}>
            <option value="">— выберите —</option>
            {UNIT_OPTIONS.map((unit) => (
              <option key={unit} value={unit}>
                {unit}
              </option>
            ))}
          </select>
          {errors.unit && <span className={styles.error}>{errors.unit.message}</span>}
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="executorName">
            ФИО исполнителя
          </label>
          <input
            id="executorName"
            type="text"
            placeholder="например, Иванов Иван"
            {...register('executorName')}
            className={styles.input}
          />
          {errors.executorName && (
            <span className={styles.error}>{errors.executorName.message}</span>
          )}
        </div>

        <div className={`${styles.field} ${styles.fieldWide}`}>
          <label className={styles.label} htmlFor="comment">
            Комментарий
          </label>
          <textarea
            id="comment"
            rows={2}
            placeholder="Необязательно"
            {...register('comment')}
            className={styles.input}
          />
          {errors.comment && <span className={styles.error}>{errors.comment.message}</span>}
        </div>
      </div>

      {errorMessage && (
        <p className={styles.submitError} role="alert">
          {errorMessage}
        </p>
      )}

      {success && !errorMessage && (
        <p className={styles.submitSuccess} role="status">
          {success}
        </p>
      )}

      <div className={styles.actions}>
        <button type="submit" className={styles.submit} disabled={isSubmitting}>
          {isSubmitting ? 'Сохранение…' : isEditing ? 'Сохранить' : 'Добавить запись'}
        </button>
        {isEditing && (
          <button
            type="button"
            className={styles.cancel}
            onClick={onCancelEdit}
            disabled={isSubmitting}
          >
            Отменить
          </button>
        )}
      </div>
    </form>
  );
}
