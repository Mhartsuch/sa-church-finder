import { useState } from 'react';
import { CalendarPlus, CalendarRange, Clock3, Pencil, Plus, Trash2 } from 'lucide-react';

import { ConfirmDialog } from '@/components/layout/ConfirmDialog';
import { EventForm } from '@/components/events/EventForm';
import { useDeleteChurchEvent } from '@/hooks/useEvents';
import { useToast } from '@/hooks/useToast';
import { ChurchEventType, IChurchEvent } from '@/types/event';

type EventManagerProps = {
  churchId: string;
  churchName: string;
  events: IChurchEvent[];
  isLoading: boolean;
  errorMessage?: string | null;
};

const formatEventDate = (date: string): string =>
  new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  }).format(new Date(date));

const formatEventTimeRange = (startTime: string, endTime?: string | null): string => {
  const formatter = new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });

  const startLabel = formatter.format(new Date(startTime));
  if (!endTime) {
    return startLabel;
  }

  return `${startLabel} - ${formatter.format(new Date(endTime))}`;
};

const formatEventTypeLabel = (eventType: ChurchEventType): string => {
  switch (eventType) {
    case 'service':
      return 'Service';
    case 'community':
      return 'Community';
    case 'volunteer':
      return 'Volunteer';
    case 'study':
      return 'Study';
    case 'youth':
      return 'Youth';
    default:
      return 'Other';
  }
};

type EditorMode = { type: 'create' } | { type: 'edit'; event: IChurchEvent } | null;

export const EventManager = ({
  churchId,
  churchName,
  events,
  isLoading,
  errorMessage = null,
}: EventManagerProps) => {
  const deleteMutation = useDeleteChurchEvent();
  const { addToast } = useToast();
  const [editorMode, setEditorMode] = useState<EditorMode>(null);
  const [eventPendingDelete, setEventPendingDelete] = useState<IChurchEvent | null>(null);

  const closeEditor = () => setEditorMode(null);

  const handleDeleteConfirmed = async () => {
    if (!eventPendingDelete) {
      return;
    }

    try {
      await deleteMutation.mutateAsync(eventPendingDelete.id);
      addToast({
        message: `Removed "${eventPendingDelete.title}" from ${churchName}`,
        variant: 'success',
      });
      setEventPendingDelete(null);
    } catch (error) {
      setEventPendingDelete(null);
      addToast({
        message: error instanceof Error ? error.message : 'Unable to delete this event right now.',
        variant: 'error',
      });
    }
  };

  return (
    <div className="rounded-[24px] border border-border bg-card p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-foreground">Upcoming events</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Publish, update, or remove public-facing events for {churchName}.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setEditorMode({ type: 'create' })}
          className="inline-flex items-center gap-2 rounded-full bg-[#FF385C] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#b00838]"
        >
          <Plus className="h-4 w-4" />
          Add event
        </button>
      </div>

      {errorMessage ? (
        <div
          role="alert"
          className="mt-4 rounded-2xl border border-[#ffc2cc] bg-[#fff0f3] px-4 py-3 text-sm text-[#a8083a]"
        >
          {errorMessage}
        </div>
      ) : null}

      {isLoading ? (
        <p className="mt-4 text-sm leading-6 text-muted-foreground">Loading upcoming events...</p>
      ) : events.length === 0 ? (
        <div className="mt-4 rounded-2xl border border-dashed border-gray-300 bg-background p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#fff5f0] text-[#FF385C]">
            <CalendarPlus className="h-5 w-5" />
          </div>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            No public events scheduled yet. Start with a gathering that is already on your calendar
            so visitors can join.
          </p>
        </div>
      ) : (
        <ul className="mt-4 space-y-3">
          {events.map((event) => (
            <li key={event.id} className="rounded-2xl border border-border bg-background p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-semibold text-foreground">{event.title}</p>
                    <span className="rounded-full bg-muted px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                      {formatEventTypeLabel(event.eventType)}
                    </span>
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      <CalendarRange className="h-4 w-4" />
                      {formatEventDate(event.startTime)}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Clock3 className="h-4 w-4" />
                      {formatEventTimeRange(event.startTime, event.endTime)}
                    </span>
                  </div>
                  {event.description ? (
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      {event.description}
                    </p>
                  ) : null}
                </div>

                <div className="flex shrink-0 flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setEditorMode({ type: 'edit', event })}
                    className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-semibold text-foreground transition-colors hover:bg-muted"
                    aria-label={`Edit ${event.title}`}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => setEventPendingDelete(event)}
                    className="inline-flex items-center gap-1.5 rounded-full border border-[#ffc2cc] bg-[#fff0f3] px-3 py-1.5 text-xs font-semibold text-[#a8083a] transition-colors hover:bg-[#ffe0e7]"
                    aria-label={`Delete ${event.title}`}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Delete
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      {editorMode ? (
        <EventForm
          churchId={churchId}
          churchName={churchName}
          existingEvent={editorMode.type === 'edit' ? editorMode.event : null}
          onClose={closeEditor}
        />
      ) : null}

      <ConfirmDialog
        open={eventPendingDelete !== null}
        title="Delete this event?"
        description={
          eventPendingDelete
            ? `"${eventPendingDelete.title}" will be removed from ${churchName}'s public listing. This cannot be undone.`
            : ''
        }
        confirmLabel="Delete event"
        variant="destructive"
        isPending={deleteMutation.isPending}
        onConfirm={() => {
          void handleDeleteConfirmed();
        }}
        onCancel={() => setEventPendingDelete(null)}
      />
    </div>
  );
};

export default EventManager;
