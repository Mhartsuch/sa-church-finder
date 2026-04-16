import { AWARD_METADATA, IAward } from '@/types/passport';

export const getAwardDisplayName = (award: IAward): string => {
  const meta = AWARD_METADATA[award.awardType];
  return meta ? `${meta.icon} ${meta.name}` : award.awardType;
};

export const getAwardDescription = (award: IAward): string => {
  const meta = AWARD_METADATA[award.awardType];
  return meta?.description ?? '';
};
