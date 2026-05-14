import CssBaseline from '@mui/material/CssBaseline'
import { ThemeProvider } from '@mui/material/styles'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import './App.css'
import { AppShell } from './app/AppShell'
import { appTheme } from './app/theme'
import { UserDataProvider } from './app/UserDataProvider'
import { HabitatsPage } from './modules/habitats/HabitatsPage'
import { HomePage } from './modules/home/HomePage'
import { PlannerPage } from './modules/planner/PlannerPage'
import { PokedexPage } from './modules/pokedex/PokedexPage'
import { getRouterBasename } from './routing'

function App() {
  return (
    <ThemeProvider theme={appTheme}>
      <CssBaseline />
      <BrowserRouter basename={getRouterBasename()}>
        <UserDataProvider>
          <Routes>
            <Route element={<AppShell />}>
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
