const STEPS = [
  {
    icon: '🔍',
    number: 1,
    title: 'Browse & Filter',
    description:
      'Search by denomination, neighborhood, service times, or worship style to find churches that match your preferences.',
  },
  {
    icon: '📋',
    number: 2,
    title: 'Check the Profile',
    description:
      'Read detailed descriptions, see photos, review service schedules, and learn what makes each church unique.',
  },
  {
    icon: '⚖️',
    number: 3,
    title: 'Save & Compare',
    description:
      'Heart your favorites and use our comparison tool to evaluate churches side by side before visiting.',
  },
  {
    icon: '🏠',
    number: 4,
    title: 'Visit in Person',
    description:
      'Use directions and service times to plan your first visit. Most churches welcome walk-ins warmly!',
  },
];

const TIPS = [
  { icon: '👔', text: 'Dress comfortably — most churches welcome casual attire' },
  { icon: '⏰', text: 'Arrive 10-15 minutes early to find seating and get oriented' },
  { icon: '👋', text: "Don't be shy — introduce yourself to greeters at the door" },
  { icon: '📱', text: 'Check the church website for visitor parking or special instructions' },
  { icon: '☕', text: 'Many churches offer coffee and fellowship time — stay after service!' },
  { icon: '🔄', text: 'Try visiting 2-3 times before deciding — each visit reveals more' },
];

export const FirstVisitGuide = () => {
  return (
    <section className="mx-auto max-w-[1760px] px-4 py-12 sm:px-6 lg:px-10">
      <h2 className="text-[22px] font-bold">New to church? Here&apos;s how it works</h2>
      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {STEPS.map((step) => (
          <div
            key={step.number}
            className="relative rounded-2xl border border-border p-6 transition-all hover:-translate-y-1 hover:shadow-airbnb"
          >
            <div className="mb-4 text-3xl">{step.icon}</div>
            <span className="absolute right-5 top-5 flex h-7 w-7 items-center justify-center rounded-full bg-muted text-[13px] font-bold text-muted-foreground">
              {step.number}
            </span>
            <h3 className="text-[16px] font-bold">{step.title}</h3>
            <p className="mt-2 text-[14px] leading-relaxed text-muted-foreground">
              {step.description}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-10">
        <h3 className="text-[16px] font-bold">Tips for your first visit</h3>
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {TIPS.map((tip) => (
            <div key={tip.text} className="flex items-start gap-3 rounded-xl bg-muted p-4">
              <span className="text-xl">{tip.icon}</span>
              <p className="text-[14px] leading-relaxed text-muted-foreground">{tip.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
