export const SA_CENTER = { lat: 29.4241, lng: -98.4936 };
export const DEFAULT_ZOOM = 11;
export const DEFAULT_RADIUS = 10;
export const PAGE_SIZE = 20;

export const DAY_OPTIONS = [
  { value: 0, label: 'Sunday' },
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' },
];

export const TIME_OPTIONS = [
  { value: 'morning', label: 'Morning (before noon)' },
  { value: 'afternoon', label: 'Afternoon (12-5pm)' },
  { value: 'evening', label: 'Evening (after 5pm)' },
];

// Distance options for the filter panel. Values are miles; passing `undefined`
// (the default) means "use the backend default of 10 miles". 25 miles is the
// documented maximum the API accepts, so the chip group stops there.
export const DISTANCE_OPTIONS = [
  { value: 2, label: '2 miles' },
  { value: 5, label: '5 miles' },
  { value: 10, label: '10 miles' },
  { value: 25, label: '25 miles' },
];

// Minimum effective rating chips. Keep the list small — users want a coarse
// floor, not a slider. `0` is the "Any rating" default, modelled as
// `undefined` in the store so it doesn't inflate the active filter count.
export const MIN_RATING_OPTIONS = [
  { value: 3, label: '3+ stars' },
  { value: 3.5, label: '3.5+ stars' },
  { value: 4, label: '4+ stars' },
  { value: 4.5, label: '4.5+ stars' },
];
