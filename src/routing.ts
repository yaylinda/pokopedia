export type TabId = 'home' | 'pokemon' | 'habitats' | 'regionPlan' | 'planner'

export const tabRoutes: Record<TabId, string> = {
  home: '/',
  pokemon: '/pokemon',
  habitats: '/habitats',
  regionPlan: '/region-plan',
  planner: '/planner',
}

export const getBasePath = () =>
  import.meta.env.BASE_URL.endsWith('/')
    ? import.meta.env.BASE_URL
    : `${import.meta.env.BASE_URL}/`

export const getTabHref = (tabId: TabId) => {
  const base = getBasePath()
  const route = tabRoutes[tabId]

  return route === '/' ? base : `${base.replace(/\/$/, '')}${route}`
}

export const getRouterBasename = () => {
  const base = getBasePath().replace(/\/$/, '')

  return base || '/'
}
