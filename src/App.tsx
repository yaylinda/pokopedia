import CssBaseline from '@mui/material/CssBaseline'
import { ThemeProvider } from '@mui/material/styles'
import { useEffect } from 'react'
import {
  BrowserRouter,
  Navigate,
  Outlet,
  Route,
  Routes,
  useNavigate,
  useSearchParams,
} from 'react-router-dom'
import './App.css'
import { AppHeader } from './components/AppHeader'
import { UserDataProvider } from './data/UserDataProvider'
import { HabitatsPage } from './modules/habitats/HabitatsPage'
import { HomePage } from './modules/home/HomePage'
import { PlannerPage } from './modules/planner/PlannerPage'
import { PokedexPage } from './modules/pokedex/PokedexPage'
import { getRouterBasename } from './routing'
import { appTheme } from './theme'

function AppLayout() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  useEffect(() => {
    const route = searchParams.get('route')

    if (!route) {
      return
    }

    const nextParams = new URLSearchParams(searchParams)

    nextParams.delete('route')
    navigate(
      `${route}${nextParams.size > 0 ? `?${nextParams.toString()}` : ''}`,
      {
        replace: true,
      },
    )
  }, [navigate, searchParams])

  return (
    <main className="app-shell">
      <AppHeader />
      <Outlet />
    </main>
  )
}

function App() {
  return (
    <ThemeProvider theme={appTheme}>
      <CssBaseline />
      <BrowserRouter basename={getRouterBasename()}>
        <UserDataProvider>
          <Routes>
            <Route element={<AppLayout />}>
              <Route index element={<HomePage />} />
              <Route path="pokemon" element={<PokedexPage />} />
              <Route path="habitats" element={<HabitatsPage />} />
              <Route path="planner" element={<PlannerPage />} />
              <Route path="*" element={<Navigate replace to="/" />} />
            </Route>
          </Routes>
        </UserDataProvider>
      </BrowserRouter>
    </ThemeProvider>
  )
}

export default App
