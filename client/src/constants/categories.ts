import {
  Accessibility,
  Baby,
  BookOpen,
  Church,
  Cross,
  Flame,
  Heart,
  Landmark,
  Languages,
  Moon,
  Sparkles,
  Star,
  Sun,
  type LucideIcon,
} from 'lucide-react';

import { IChurchFilters } from '@/types/church';

/**
 * Category bar presets. Each one toggles a single refinement so the category
 * bar and the Filters modal always agree about what is applied.
 */
export interface ICategory {
  id: string;
  label: string;
  icon: LucideIcon;
  isActive: (filters: IChurchFilters) => boolean;
  toggle: (filters: IChurchFilters) => IChurchFilters;
}

const denomination = (id: string, label: string, family: string, icon: LucideIcon): ICategory => ({
  id,
  label,
  icon,
  isActive: (f) => f.denominations.length === 1 && f.denominations[0] === family,
  toggle: (f) => ({
    ...f,
    denominations: f.denominations.length === 1 && f.denominations[0] === family ? [] : [family],
  }),
});

const flag = (
  id: string,
  label: string,
  key: 'wheelchairAccessible' | 'goodForChildren' | 'goodForGroups',
  icon: LucideIcon,
): ICategory => ({
  id,
  label,
  icon,
  isActive: (f) => f[key],
  toggle: (f) => ({ ...f, [key]: !f[key] }),
});

export const CATEGORIES: ICategory[] = [
  {
    id: 'sunday-morning',
    label: 'Sunday morning',
    icon: Sun,
    isActive: (f) => f.day === 0 && f.time === 'morning',
    toggle: (f) =>
      f.day === 0 && f.time === 'morning'
        ? { ...f, day: undefined, time: undefined }
        : { ...f, day: 0, time: 'morning' },
  },
  {
    id: 'top-rated',
    label: 'Top rated',
    icon: Star,
    isActive: (f) => f.minRating === 4,
    toggle: (f) => ({ ...f, minRating: f.minRating === 4 ? undefined : 4 }),
  },
  denomination('non-denominational', 'Non-denominational', 'Non-denominational', Sparkles),
  denomination('catholic', 'Catholic', 'Catholic', Cross),
  denomination('baptist', 'Baptist', 'Baptist', BookOpen),
  denomination('methodist', 'Methodist', 'Methodist', Flame),
  denomination('pentecostal', 'Pentecostal', 'Pentecostal', Heart),
  denomination('lutheran', 'Lutheran', 'Lutheran', Church),
  denomination('anglican', 'Anglican', 'Anglican/Episcopal', Landmark),
  {
    id: 'spanish',
    label: 'En español',
    icon: Languages,
    isActive: (f) => f.languages.includes('Spanish'),
    toggle: (f) => ({
      ...f,
      languages: f.languages.includes('Spanish')
        ? f.languages.filter((language) => language !== 'Spanish')
        : [...f.languages, 'Spanish'],
    }),
  },
  flag('kids', 'Great for kids', 'goodForChildren', Baby),
  flag('accessible', 'Accessible', 'wheelchairAccessible', Accessibility),
  {
    id: 'evening',
    label: 'Evening services',
    icon: Moon,
    isActive: (f) => f.time === 'evening' && f.day === undefined,
    toggle: (f) => ({ ...f, day: undefined, time: f.time === 'evening' ? undefined : 'evening' }),
  },
];
