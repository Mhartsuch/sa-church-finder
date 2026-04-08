import { useSearchStore } from '@/stores/search-store';

interface DenominationInfo {
  icon: string;
  name: string;
  count: string;
  description: string;
  traits: string[];
}

const DENOMINATIONS: DenominationInfo[] = [
  {
    icon: '💧',
    name: 'Baptist',
    count: '6 churches',
    description: "Emphasizes believer's baptism by immersion and biblical authority.",
    traits: ['Baptism by immersion', 'Bible-centered', 'Congregational'],
  },
  {
    icon: '✝️',
    name: 'Catholic',
    count: '8 churches',
    description: 'Rich liturgical tradition with sacraments, saints, and global community.',
    traits: ['Sacramental', 'Liturgical', 'Historic'],
  },
  {
    icon: '🌳',
    name: 'Non-denominational',
    count: '5 churches',
    description: 'Independent churches focused on the Bible without denominational ties.',
    traits: ['Contemporary', 'Bible-focused', 'Flexible'],
  },
  {
    icon: '✨',
    name: 'Methodist',
    count: '3 churches',
    description: 'Blends tradition with social justice and personal holiness.',
    traits: ['Social justice', 'Inclusive', 'Structured'],
  },
  {
    icon: '🌅',
    name: 'Episcopal',
    count: '2 churches',
    description: 'Anglican tradition with liturgical worship and progressive theology.',
    traits: ['Liturgical', 'Progressive', 'Sacramental'],
  },
  {
    icon: '🌿',
    name: 'Lutheran',
    count: '2 churches',
    description: 'Reformation heritage emphasizing grace, faith, and scripture.',
    traits: ['Grace-centered', 'Hymn tradition', 'Theological'],
  },
  {
    icon: '📜',
    name: 'Presbyterian',
    count: '2 churches',
    description: 'Reformed tradition with elder-led governance and intellectual depth.',
    traits: ['Reformed theology', 'Elder-led', 'Educational'],
  },
  {
    icon: '🔥',
    name: 'Pentecostal',
    count: '2 churches',
    description: 'Charismatic worship with emphasis on the Holy Spirit and gifts.',
    traits: ['Spirit-filled', 'Expressive', 'Healing ministry'],
  },
];

interface DenominationGuideProps {
  onSelectDenomination?: (denomination: string) => void;
}

export const DenominationGuide = ({ onSelectDenomination }: DenominationGuideProps) => {
  const setFilter = useSearchStore((state) => state.setFilter);
  const setQuery = useSearchStore((state) => state.setQuery);

  const handleSelect = (name: string) => {
    if (onSelectDenomination) {
      onSelectDenomination(name);
      return;
    }
    setFilter('denomination', name);
    setQuery('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <section className="mx-auto max-w-[1760px] px-4 py-12 sm:px-6 lg:px-10">
      <h2 className="text-[22px] font-bold">Explore denominations</h2>
      <p className="mt-1 text-[15px] text-muted-foreground">
        Learn about the different traditions represented in San Antonio
      </p>
      <div className="hide-scrollbar mt-6 flex gap-4 overflow-x-auto pb-2">
        {DENOMINATIONS.map((denom) => (
          <button
            key={denom.name}
            type="button"
            onClick={() => handleSelect(denom.name)}
            className="flex min-w-[220px] flex-shrink-0 flex-col rounded-2xl border border-border p-5 text-left transition-all hover:-translate-y-1 hover:shadow-airbnb"
          >
            <span className="text-3xl">{denom.icon}</span>
            <h3 className="mt-3 text-[16px] font-bold">{denom.name}</h3>
            <p className="text-[13px] text-muted-foreground">{denom.count}</p>
            <p className="mt-2 text-[14px] leading-relaxed text-muted-foreground">
              {denom.description}
            </p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {denom.traits.map((trait) => (
                <span
                  key={trait}
                  className="rounded-full bg-muted px-2.5 py-1 text-[12px] font-medium text-muted-foreground"
                >
                  {trait}
                </span>
              ))}
            </div>
          </button>
        ))}
      </div>
    </section>
  );
};
