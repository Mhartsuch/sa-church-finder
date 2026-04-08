const EVENT_TYPES: Record<string, string> = {
  Service: '#dcfce7',
  Outreach: '#dbeafe',
  Youth: '#fef9c3',
  Workshop: '#f3e8ff',
  Music: '#ffe4e6',
  Kids: '#ffedd5',
};

interface EventItem {
  id: number;
  day: number;
  month: string;
  year: number;
  title: string;
  church: string;
  time: string;
  location: string;
  type: string;
}

const EVENTS: EventItem[] = [
  {
    id: 1,
    day: 12,
    month: 'Apr',
    year: 2026,
    title: 'Easter Sunrise Service',
    church: 'San Fernando Cathedral',
    time: '6:30 AM',
    location: 'Main Sanctuary',
    type: 'Service',
  },
  {
    id: 2,
    day: 15,
    month: 'Apr',
    year: 2026,
    title: 'Community Food Drive',
    church: 'Community Bible Church',
    time: '9:00 AM – 2:00 PM',
    location: 'Parking Lot',
    type: 'Outreach',
  },
  {
    id: 3,
    day: 19,
    month: 'Apr',
    year: 2026,
    title: 'Youth Night: Game On!',
    church: 'Cornerstone Church',
    time: '6:30 PM',
    location: 'Youth Center',
    type: 'Youth',
  },
  {
    id: 4,
    day: 22,
    month: 'Apr',
    year: 2026,
    title: 'Marriage Enrichment Workshop',
    church: 'Oak Hills Church',
    time: '7:00 PM',
    location: 'Fellowship Hall',
    type: 'Workshop',
  },
  {
    id: 5,
    day: 26,
    month: 'Apr',
    year: 2026,
    title: 'Worship Night Under the Stars',
    church: 'Mission Concepción',
    time: '7:30 PM',
    location: 'Courtyard',
    type: 'Music',
  },
  {
    id: 6,
    day: 3,
    month: 'May',
    year: 2026,
    title: 'VBS Registration Opens',
    church: 'First Baptist Church SA',
    time: '10:00 AM',
    location: 'Main Office',
    type: 'Kids',
  },
];

export const EventsCalendar = () => {
  return (
    <section className="mx-auto max-w-[1760px] px-4 py-12 sm:px-6 lg:px-10">
      <h2 className="text-[22px] font-bold">Upcoming community events</h2>
      <p className="mt-1 text-[15px] text-muted-foreground">
        Connect with local churches through events and gatherings
      </p>
      <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {EVENTS.map((event) => (
          <div
            key={event.id}
            className="overflow-hidden rounded-2xl border border-border transition-all hover:-translate-y-[3px] hover:shadow-airbnb"
          >
            <div
              className="px-5 py-3"
              style={{ background: 'linear-gradient(to right, #E61E4D, #E31C5F, #D70466)' }}
            >
              <div className="text-[28px] font-bold leading-tight text-white">{event.day}</div>
              <div className="text-[13px] font-medium text-white/80">
                {event.month} {event.year}
              </div>
            </div>
            <div className="p-5">
              <h3 className="text-[16px] font-bold leading-tight">{event.title}</h3>
              <p className="mt-1 flex items-center gap-1 text-[14px] text-muted-foreground">
                ⛪ {event.church}
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-3 text-[13px] text-muted-foreground">
                <span>🕐 {event.time}</span>
                <span>📍 {event.location}</span>
              </div>
              <span
                className="mt-3 inline-block rounded-full px-3 py-1 text-[12px] font-semibold"
                style={{
                  backgroundColor: EVENT_TYPES[event.type] ?? '#f0f0f0',
                  color: '#222',
                }}
              >
                {event.type}
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
