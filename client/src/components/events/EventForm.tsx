import { FormEvent, useEffect, useState } from 'react';
import { CalendarPlus, Save, X } from 'lucide-react';

import { useCreateChurchEvent, useUpdateChurchEvent } from '@/hooks/useEvents';
import { useToast } from '@/hooks/useToast';
import {
  ChurchEventType,
  EVENT_TYPES,
  IChurchEvent,
  ICreateChurchEventInput,
  IUpdateChurchEventInput,
} from '@/types/event';

type EventFormState = {
  title: string;
  description: string;
  eventType: ChurchEventType;
  startTime: string;
  endTime: string;
  locationOverride: string;
};

type EventFormProps = {
  churchId: string;
  churchName: string;
  existingEvent?: IChurchEvent | null;
  onClose: () => void;
  onSaved?: (event: IChurchEvent) => void;
};

const eventTypeLabels: Record<ChurchEventType, string> = {
  service: 'Service',
  community: 'Community',
  volunteer: 'Volunteer',
  study: 'Study',
  youth: 'Youth',
  other: 'Other',
};

const toLocalInputValue = (isoString: string | null | undefined): string => {
  if (!isoString) {
    return '';
  }

  const date = new Date(isoString);

  if (Number.isNaN(date.getTime())) {
    return '';
  }

  const pad = (value: number): string => value.toString().padStart(2, '0');

  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());

  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

const fromLocalInputValue = (value: string): string | null => {
  if (!value) {
    return null;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date.toISOString();
};

const buildInitialFormState = (existingEvent: IChurchEvent | null): EventFormState => {
  if (!existingEvent) {
    return {
      title: '',
      description: '',
      eventType: 'service',
      startTime: '',
      endTime: '',
      locationOverride: '',
    };
  }

  return {
    title: existingEvent.title,
    description: existingEvent.description ?? '',
    eventType: existingEvent.eventType,
    startTime: toLocalInputValue(existingEvent.startTime),
    endTime: toLocalInputValue(existingEvent.endTime),
    locationOverride: existingEvent.locationOverride ?? '',
  };
};

const validateFormState = (formState: EventFormState): string | null => {
  const title = formState.title.trim();
  if (title.length < 2) {
    return 'Give this event a title visitors will recognize (at least 2 characters).';
  }

  if (title.length > 200) {
    return 'Keep the event title under 200 characters.';
  }

  if (formState.description.length > 5000) {
    return 'The description is too long (max 5000 characters).';
  }

  if (formState.locationOverride.length > 200) {
    return 'The location override is too long (max 200 characters).';
  }

  const startIso = fromLocalInputValue(formState.startTime);
  if (!startIso) {
    return 'Choose a valid start date and time.';
  }

  if (formState.endTime) {
    const endIso = fromLocalInputValue(formState.endTime);
    if (!endIso) {
      return 'Choose a valid end date and time.';
    }

    if (new Date(endIso).getTime() <= new Date(startIso).getTime()) {
      return 'End time must be after start time.';
    }
  }

  return null;
};

export const EventForm = ({
  churchId,
  churchName,
  existingEvent = null,
  onClose,
  onSaved,
}: EventFormProps) => {
  const createMutation = useCreateChurchEvent();
  const updateMutation = useUpdateChurchEvent();
  const { addToast } = useToast();
  const [formState, setFormState] = useState<EventFormState>(() =>
    buildInitialFormState(existingEvent),
  );
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    setFormState(buildInitialFormState(existingEvent ?? null));
    setFormError(null);
  }, [existingEvent]);

  const isEditing = Boolean(existingEvent);
  const isPending = createMutation.isPending || updateMutation.isPending;

  const handleChange = <K extends keyof EventFormState>(field: K, value: EventFormState[K]) => {
    setFormState((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);

    const validationError = validateFormState(formState);
    if (validationError) {
      setFormError(validationError);
      return;
    }

    const startIso = fromLocalInputValue(formState.startTime);
    const endIso = formState.endTime ? fromLocalInputValue(formState.endTime) : null;

    if (!startIso) {
      setFormError('Choose a valid start date and time.');
      return;
    }

    try {
      if (existingEvent) {
        const updatePayload: IUpdateChurchEventInput = {
          eventId: existingEvent.id,
          title: formState.title.trim(),
          description: formState.description.trim() || null,
          eventType: formState.eventType,
          startTime: startIso,
          endTime: endIso,
          locationOverride: formState.locationOverride.trim() || null,
        };

        const updated = await updateMutation.mutateAsync(updatePayload);
        addToast({ message: 'Event updated successfully', variant: 'success' });
        onSaved?.(updated);
      } else {
        const createPayload: ICreateChurchEventInput = {
          churchId,
          title: formState.title.trim(),
          description: formState.description.trim() || null,
          eventType: formState.eventType,
          startTime: startIso,
          endTime: endIso,
          locationOverride: formState.locationOverride.trim() || null,
        };

        const created = await createMutation.mutateAsync(createPayload);
        addToast({
          message: `Published "${created.title}" for ${churchName}`,
          variant: 'success',
        });
        onSaved?.(created);
      }

      onClose();
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Unable to save this event right now.');
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="event-form-title"
      className="fixed inset-0 z-[80] flex items-center justify-center bg-black/40 p-4 backdrop-blur-[2px]"
    >
      <div className="max-h-full w-full max-w-xl overflow-y-auto rounded-[28px] border border-border bg-card p-6 shadow-airbnb">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#fff5f0] text-[#FF385C]">
              <CalendarPlus className="h-5 w-5" />
            </div>
            <h2 id="event-form-title" className="mt-4 text-2xl font-semibold text-foreground">
              {isEditing ? 'Update event' : 'Add a new event'}
            </h2>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              {isEditing
                ? `Edit the details visitors see for this ${churchName} event.`
                : `Publish an upcoming ${churchName} event so visitors can plan ahead.`}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="rounded-full border border-border bg-card p-2 text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-70"
            aria-label="Close event form"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <label className="block">
            <span className="text-sm font-semibold text-foreground">Title</span>
            <input
              type="text"
              value={formState.title}
              onChange={(event) => handleChange('title', event.target.value)}
              disabled={isPending}
              placeholder="e.g. Easter Sunday Service"
              className="mt-2 w-full rounded-2xl border border-border bg-card px-4 py-3 text-sm text-foreground outline-none transition-colors focus:border-foreground disabled:cursor-not-allowed disabled:opacity-70"
              required
            />
          </label>

          <label className="block">
            <span className="text-sm font-semibold text-foreground">Event type</span>
            <select
              value={formState.eventType}
              onChange={(event) => handleChange('eventType', event.target.value as ChurchEventType)}
              disabled={isPending}
              className="mt-2 w-full rounded-2xl border border-border bg-card px-4 py-3 text-sm text-foreground outline-none transition-colors focus:border-foreground disabled:cursor-not-allowed disabled:opacity-70"
            >
              {EVENT_TYPES.map((option) => (
                <option key={option} value={option}>
                  {eventTypeLabels[option]}
                </option>
              ))}
            </select>
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="text-sm font-semibold text-foreground">Start</span>
              <input
                type="datetime-local"
                value={formState.startTime}
                onChange={(event) => handleChange('startTime', event.target.value)}
                disabled={isPending}
                className="mt-2 w-full rounded-2xl border border-border bg-card px-4 py-3 text-sm text-foreground outline-none transition-colors focus:border-foreground disabled:cursor-not-allowed disabled:opacity-70"
                required
              />
            </label>
            <label className="block">
              <span className="text-sm font-semibold text-foreground">End (optional)</span>
              <input
                type="datetime-local"
                value={formState.endTime}
                onChange={(event) => handleChange('endTime', event.target.value)}
                disabled={isPending}
                className="mt-2 w-full rounded-2xl border border-border bg-card px-4 py-3 text-sm text-foreground outline-none transition-colors focus:border-foreground disabled:cursor-not-allowed disabled:opacity-70"
              />
            </label>
          </div>

          <label className="block">
            <span className="text-sm font-semibold text-foreground">
              Location override (optional)
            </span>
            <input
              type="text"
              value={formState.locationOverride}
              onChange={(event) => handleChange('locationOverride', event.target.value)}
              disabled={isPending}
              placeholder="Leave blank to use the church's main address"
              className="mt-2 w-full rounded-2xl border border-border bg-card px-4 py-3 text-sm text-foreground outline-none transition-colors focus:border-foreground disabled:cursor-not-allowed disabled:opacity-70"
            />
          </label>

          <label className="block">
            <span className="text-sm font-semibold text-foreground">Description</span>
            <textarea
              value={formState.description}
              onChange={(event) => handleChange('description', event.target.value)}
              disabled={isPending}
              rows={4}
              placeholder="Share what visitors can expect, who the event is for, and how to prepare."
              className="mt-2 w-full rounded-[24px] border border-border bg-card px-4 py-3 text-sm leading-6 text-foreground outline-none transition-colors focus:border-foreground disabled:cursor-not-allowed disabled:opacity-70"
            />
          </label>

          {formError ? (
            <div
              role="alert"
              className="rounded-2xl border border-[#ffc2cc] bg-[#fff0f3] px-4 py-3 text-sm text-[#a8083a]"
            >
              {formError}
            </div>
          ) : null}

          <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:items-center sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="rounded-full border border-border bg-card px-5 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-70"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[#FF385C] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#b00838] disabled:cursor-not-allowed disabled:opacity-70"
            >
              <Save className="h-4 w-4" />
              {isPending
                ? isEditing
                  ? 'Saving...'
                  : 'Publishing...'
                : isEditing
                  ? 'Save changes'
                  : 'Publish event'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EventForm;
