import { FormEvent, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { X } from 'lucide-react';

import {
  createChurchService,
  CreateChurchServiceInput,
  updateChurchService,
  UpdateChurchServiceInput,
} from '@/api/church-services';
import { useToast } from '@/hooks/useToast';
import { IChurchService } from '@/types/church';

const DAYS_OF_WEEK = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
] as const;

type ServiceFormProps = {
  churchId: string;
  churchName: string;
  existingService: IChurchService | null;
  onClose: () => void;
};

export const ServiceForm = ({
  churchId,
  churchName,
  existingService,
  onClose,
}: ServiceFormProps) => {
  const queryClient = useQueryClient();
  const { addToast } = useToast();
  const isEditing = existingService !== null;

  const [dayOfWeek, setDayOfWeek] = useState(existingService?.dayOfWeek ?? 0);
  const [startTime, setStartTime] = useState(existingService?.startTime ?? '09:00');
  const [endTime, setEndTime] = useState(existingService?.endTime ?? '');
  const [serviceType, setServiceType] = useState(existingService?.serviceType ?? '');
  const [language, setLanguage] = useState(existingService?.language ?? 'English');
  const [description, setDescription] = useState(existingService?.isAutoImported ? '' : '');

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['leaders-portal', 'church'] });
    queryClient.invalidateQueries({ queryKey: ['church-detail'] });
  };

  const createMutation = useMutation({
    mutationFn: (input: CreateChurchServiceInput) => createChurchService(input),
    onSuccess: () => {
      invalidate();
      addToast({ message: 'Service time added', variant: 'success' });
      onClose();
    },
    onError: (error: Error) => {
      addToast({ message: error.message, variant: 'error' });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (input: UpdateChurchServiceInput) => updateChurchService(input),
    onSuccess: () => {
      invalidate();
      addToast({ message: 'Service time updated', variant: 'success' });
      onClose();
    },
    onError: (error: Error) => {
      addToast({ message: error.message, variant: 'error' });
    },
  });

  const isPending = createMutation.isPending || updateMutation.isPending;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!serviceType.trim()) return;

    if (isEditing) {
      updateMutation.mutate({
        id: existingService.id,
        dayOfWeek,
        startTime,
        endTime: endTime || null,
        serviceType: serviceType.trim(),
        language: language.trim() || 'English',
        description: description.trim() || null,
      });
    } else {
      createMutation.mutate({
        churchId,
        dayOfWeek,
        startTime,
        endTime: endTime || null,
        serviceType: serviceType.trim(),
        language: language.trim() || 'English',
        description: description.trim() || null,
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-lg rounded-[28px] border border-border bg-card p-6 shadow-airbnb sm:p-8">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-xl font-bold text-foreground">
            {isEditing ? 'Edit service time' : 'Add service time'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full transition-colors hover:bg-muted"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">{churchName}</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label htmlFor="serviceType" className="block text-sm font-medium text-foreground">
              Service name
            </label>
            <input
              id="serviceType"
              type="text"
              value={serviceType}
              onChange={(e) => setServiceType(e.target.value)}
              placeholder="e.g., Sunday Worship, Bible Study"
              className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-[#FF385C] focus:outline-none focus:ring-1 focus:ring-[#FF385C]"
              required
            />
          </div>

          <div>
            <label htmlFor="dayOfWeek" className="block text-sm font-medium text-foreground">
              Day of week
            </label>
            <select
              id="dayOfWeek"
              value={dayOfWeek}
              onChange={(e) => setDayOfWeek(Number(e.target.value))}
              className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-[#FF385C] focus:outline-none focus:ring-1 focus:ring-[#FF385C]"
            >
              {DAYS_OF_WEEK.map((day, index) => (
                <option key={day} value={index}>
                  {day}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="startTime" className="block text-sm font-medium text-foreground">
                Start time
              </label>
              <input
                id="startTime"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-[#FF385C] focus:outline-none focus:ring-1 focus:ring-[#FF385C]"
                required
              />
            </div>
            <div>
              <label htmlFor="endTime" className="block text-sm font-medium text-foreground">
                End time <span className="text-muted-foreground">(optional)</span>
              </label>
              <input
                id="endTime"
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-[#FF385C] focus:outline-none focus:ring-1 focus:ring-[#FF385C]"
              />
            </div>
          </div>

          <div>
            <label htmlFor="language" className="block text-sm font-medium text-foreground">
              Language
            </label>
            <input
              id="language"
              type="text"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              placeholder="English"
              className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-[#FF385C] focus:outline-none focus:ring-1 focus:ring-[#FF385C]"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-foreground">
              Description <span className="text-muted-foreground">(optional)</span>
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief note about this service..."
              rows={2}
              className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-[#FF385C] focus:outline-none focus:ring-1 focus:ring-[#FF385C]"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-border bg-card px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!serviceType.trim() || isPending}
              className="rounded-full bg-[#FF385C] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#b00838] disabled:opacity-50"
            >
              {isPending
                ? isEditing
                  ? 'Saving...'
                  : 'Adding...'
                : isEditing
                  ? 'Save changes'
                  : 'Add service time'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
