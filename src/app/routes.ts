export const appRoutes = {
  regionRoster: '/region-roster',
} as const

export const getRouterBasename = () =>
  import.meta.env.BASE_URL.replace(/\/$/, '') || '/'
