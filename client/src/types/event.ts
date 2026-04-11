export const EVENT_TYPES = [
  'service',
  'community',
  'volunteer',
  'study',
  'youth',
  'other',
] as const;

export type ChurchEventType = (typeof EVENT_TYPES)[number];

export interface IChurchEvent {
  id: string;
  churchId: string;
  title: string;
  description: string | null;
  eventType: ChurchEventType;
  startTime: string;
  endTime: string | null;
  locationOverride: string | null;
  isRecurring: boolean;
  recurrenceRule: string | null;
  createdById: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface IChurchEventFilters {
  type?: ChurchEventType;
  from?: string;
  to?: string;
}

export interface IChurchEventsResponse {
  data: IChurchEvent[];
  meta: {
    total: number;
    filters: {
      type?: ChurchEventType;
      from: string;
      to?: string;
    };
  };
}

export interface ICreateChurchEventInput {
  churchId: string;
  title: string;
  description?: string | null;
  eventType: ChurchEventType;
  startTime: string;
  endTime?: string | null;
  locationOverride?: string | null;
  isRecurring?: boolean;
  recurrenceRule?: string | null;
}

export interface IUpdateChurchEventInput {
  eventId: string;
  title?: string;
  description?: string | null;
  eventType?: ChurchEventType;
  startTime?: string;
  endTime?: string | null;
  locationOverride?: string | null;
  isRecurring?: boolean;
  recurrenceRule?: string | null;
}

export interface IDeleteChurchEventResult {
  id: string;
  churchId: string;
  deleted: true;
}

export interface IEventChurchSummary {
  id: string;
  slug: string;
  name: string;
  city: string;
  denomination: string | null;
  coverImageUrl: string | null;
}

export interface IAggregatedEvent extends IChurchEvent {
  church: IEventChurchSummary;
}

export interface IEventsFeedFilters {
  type?: ChurchEventType;
  from?: string;
  to?: string;
  q?: string;
  page?: number;
  pageSize?: number;
}

export interface IEventsFeedResponse {
  data: IAggregatedEvent[];
  meta: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
    filters: {
      type?: ChurchEventType;
      from: string;
      to?: string;
      q?: string;
    };
  };
}
