export interface IRibbonCategory {
  id: string;
  label: string;
  icon: string;
  slug: string;
  filterType: 'QUERY' | 'DENOMINATION';
  filterValue: string;
  position: number;
  isVisible: boolean;
  source: 'MANUAL' | 'AUTO';
  isPinned: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface IRibbonCategoriesResponse {
  data: IRibbonCategory[];
}
