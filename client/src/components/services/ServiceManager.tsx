import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Clock3, Pencil, Plus, Trash2 } from 'lucide-react';

import { deleteChurchService } from '@/api/church-services';
import { ConfirmDialog } from '@/components/layout/ConfirmDialog';
import { ServiceForm } from '@/components/services/ServiceForm';
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

type ServiceManagerProps = {
  churchId: string;
  churchName: string;
  services: IChurchService[];
  isLoading: boolean;
};

const formatTime = (time: string): string => {
  const [hours, minutes] = time.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${String(minutes).padStart(2, '0')} ${period}`;
};

const formatTimeRange = (startTime: string, endTime: string | null): string => {
  const start = formatTime(startTime);
  if (!endTime) return start;
  return `${start} - ${formatTime(endTime)}`;
};

type EditorMode = { type: 'create' } | { type: 'edit'; service: IChurchService } | null;

export const ServiceManager = ({
  churchId,
  churchName,
  services,
  isLoading,
}: ServiceManagerProps) => {
  const queryClient = useQueryClient();
  const { addToast } = useToast();
  const [editorMode, setEditorMode] = useState<EditorMode>(null);
  const [servicePendingDelete, setServicePendingDelete] = useState<IChurchService | null>(null);

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteChurchService(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leaders-portal', 'church'] });
      queryClient.invalidateQueries({ queryKey: ['church-detail'] });
      setServicePendingDelete(null);
      addToast({ message: 'Service time removed', variant: 'success' });
    },
    onError: (error: Error) => {
      setServicePendingDelete(null);
      addToast({ message: error.message, variant: 'error' });
    },
  });

  // Group services by day — filter out incomplete entries from mock/partial data
  const validServices = services.filter(
    (s) => typeof s.dayOfWeek === 'number' && typeof s.startTime === 'string',
  );
  const servicesByDay = validServices.reduce<Record<number, IChurchService[]>>((acc, service) => {
    const day = service.dayOfWeek;
    if (!acc[day]) acc[day] = [];
    acc[day].push(service);
    return acc;
  }, {});

  const sortedDays = Object.keys(servicesByDay)
    .map(Number)
    .sort((a, b) => a - b);

  return (
    <div className="rounded-[24px] border border-border bg-card p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-foreground">Service times</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage weekly service schedule for {churchName}.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setEditorMode({ type: 'create' })}
          className="inline-flex items-center gap-2 rounded-full bg-[#FF385C] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#b00838]"
        >
          <Plus className="h-4 w-4" />
          Add time
        </button>
      </div>

      {isLoading ? (
        <p className="mt-4 text-sm leading-6 text-muted-foreground">Loading service times...</p>
      ) : validServices.length === 0 ? (
        <div className="mt-4 rounded-2xl border border-dashed border-gray-300 bg-background p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#fff5f0] text-[#FF385C]">
            <Clock3 className="h-5 w-5" />
          </div>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            No service times listed. Add your weekly schedule so visitors know when to visit.
          </p>
        </div>
      ) : (
        <ul className="mt-4 space-y-3">
          {sortedDays.map((day) => (
            <li key={day}>
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                {DAYS_OF_WEEK[day]}
              </p>
              <div className="space-y-2">
                {servicesByDay[day].map((service) => (
                  <div
                    key={service.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-background p-3"
                  >
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-semibold text-foreground">
                          {service.serviceType}
                        </p>
                        {service.language && service.language !== 'English' ? (
                          <span className="rounded-full bg-[#eef5ff] px-2 py-0.5 text-[11px] font-semibold text-[#1d4ed8]">
                            {service.language}
                          </span>
                        ) : null}
                        {service.isAutoImported ? (
                          <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-semibold text-muted-foreground">
                            Auto-imported
                          </span>
                        ) : null}
                      </div>
                      <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                        <Clock3 className="h-3.5 w-3.5" />
                        {formatTimeRange(service.startTime, service.endTime)}
                      </p>
                    </div>
                    <div className="flex shrink-0 gap-2">
                      <button
                        type="button"
                        onClick={() => setEditorMode({ type: 'edit', service })}
                        className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-semibold text-foreground transition-colors hover:bg-muted"
                        aria-label={`Edit ${service.serviceType}`}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => setServicePendingDelete(service)}
                        className="inline-flex items-center gap-1.5 rounded-full border border-[#ffc2cc] bg-[#fff0f3] px-3 py-1.5 text-xs font-semibold text-[#a8083a] transition-colors hover:bg-[#ffe0e7]"
                        aria-label={`Delete ${service.serviceType}`}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </li>
          ))}
        </ul>
      )}

      {editorMode ? (
        <ServiceForm
          churchId={churchId}
          churchName={churchName}
          existingService={editorMode.type === 'edit' ? editorMode.service : null}
          onClose={() => setEditorMode(null)}
        />
      ) : null}

      <ConfirmDialog
        open={servicePendingDelete !== null}
        title="Delete this service time?"
        description={
          servicePendingDelete
            ? `"${servicePendingDelete.serviceType}" on ${DAYS_OF_WEEK[servicePendingDelete.dayOfWeek]} will be removed from ${churchName}'s public listing.`
            : ''
        }
        confirmLabel="Delete service time"
        variant="destructive"
        isPending={deleteMutation.isPending}
        onConfirm={() => {
          if (servicePendingDelete) {
            deleteMutation.mutate(servicePendingDelete.id);
          }
        }}
        onCancel={() => setServicePendingDelete(null)}
      />
    </div>
  );
};
