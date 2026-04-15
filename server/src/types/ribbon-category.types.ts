import { RibbonCategoryFilterType, RibbonCategorySource } from '@prisma/client'

export interface IRibbonCategory {
  id: string
  label: string
  icon: string
  slug: string
  filterType: RibbonCategoryFilterType
  filterValue: string
  position: number
  isVisible: boolean
  source: RibbonCategorySource
  isPinned: boolean
  createdAt: Date
  updatedAt: Date
}

export interface ICreateRibbonCategoryInput {
  label: string
  icon?: string
  slug?: string
  filterType: RibbonCategoryFilterType
  filterValue: string
  position?: number
  isVisible?: boolean
  isPinned?: boolean
}

export interface IUpdateRibbonCategoryInput {
  label?: string
  icon?: string
  filterType?: RibbonCategoryFilterType
  filterValue?: string
  position?: number
  isVisible?: boolean
  isPinned?: boolean
}

export interface IReorderRibbonCategoriesInput {
  ids: string[]
}

export interface IAutoGenerateInput {
  limit?: number
}

export interface IAutoGenerateResult {
  created: number
  updated: number
  removed: number
}

export interface IDeleteRibbonCategoryResult {
  id: string
  deleted: true
}
