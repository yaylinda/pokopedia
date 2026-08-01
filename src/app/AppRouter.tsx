import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useSearchParams,
} from 'react-router-dom'
import { RegionRosterPage } from '../modules/region-roster/RegionRosterPage'
import { AppLayout } from './layout/AppLayout'
import { appRoutes, getRouterBasename } from './routes'

function RedirectToRoster() {
  const [searchParams] = useSearchParams()
  const nextSearchParams = new URLSearchParams(searchParams)

  // GitHub Pages' 404 shim stores the requested path in this parameter.
  nextSearchParams.delete('route')
  const query = nextSearchParams.toString()

  return (
    <Navigate
      replace
      to={`${appRoutes.regionRoster}${query ? `?${query}` : ''}`}
    />
  )
}

export function AppRouter() {
  return (
    <BrowserRouter basename={getRouterBasename()}>
      <Routes>
        <Route element={<AppLayout />}>
          <Route
            element={<RegionRosterPage />}
            path={appRoutes.regionRoster}
          />
          <Route path="*" element={<RedirectToRoster />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
