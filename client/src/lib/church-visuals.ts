interface ChurchVisualInput {
  name: string
  slug: string
  denomination?: string | null
  neighborhood?: string | null
}

const VISUAL_THEMES = [
  {
    surfaceClass: 'from-[#1f4d3b] via-[#2b6a53] to-[#d6a559]',
    glowClass: 'bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.34),transparent_45%)]',
    outlineClass: 'border-white/20 bg-white/10',
  },
  {
    surfaceClass: 'from-[#18324d] via-[#2b5e87] to-[#ef8a4b]',
    glowClass: 'bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.28),transparent_42%)]',
    outlineClass: 'border-white/20 bg-white/10',
  },
  {
    surfaceClass: 'from-[#4b253a] via-[#8b4d6a] to-[#f1b15a]',
    glowClass: 'bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.18),transparent_55%)]',
    outlineClass: 'border-white/20 bg-white/10',
  },
  {
    surfaceClass: 'from-[#4d311f] via-[#9b6336] to-[#f2d28b]',
    glowClass: 'bg-[radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.22),transparent_48%)]',
    outlineClass: 'border-white/20 bg-white/10',
  },
]

const STOP_WORDS = new Set(['the', 'of', 'and', 'church', 'cathedral', 'mission'])

export const getChurchVisualTheme = (church: ChurchVisualInput) => {
  const seed = `${church.slug}-${church.denomination ?? ''}-${church.neighborhood ?? ''}`
  const hash = seed.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  return VISUAL_THEMES[hash % VISUAL_THEMES.length]
}

export const getChurchMonogram = (name: string) => {
  const significantWords = name
    .split(/\s+/)
    .map((word) => word.replace(/[^A-Za-z]/g, ''))
    .filter((word) => word.length > 0 && !STOP_WORDS.has(word.toLowerCase()))

  const source = significantWords.length > 0 ? significantWords : name.split(/\s+/)
  return source
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase())
    .join('')
}
