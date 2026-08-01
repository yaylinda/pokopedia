import Box from '@mui/material/Box'
import CssBaseline from '@mui/material/CssBaseline'
import { ThemeProvider } from '@mui/material/styles'
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useSearchParams,
} from 'react-router-dom'
import { UserDataProvider } from './data/UserDataProvider'
import { RegionRosterPage } from './modules/region-roster/RegionRosterPage'
import { appTheme } from './theme'

const getRouterBasename = () =>
  import.meta.env.BASE_URL.replace(/\/$/, '') || '/'

function RedirectToRoster() {
  const [searchParams] = useSearchParams()
  const nextSearchParams = new URLSearchParams(searchParams)

  // GitHub Pages' 404 shim stores the requested path in this parameter.
  nextSearchParams.delete('route')
  const query = nextSearchParams.toString()

  return <Navigate replace to={`/region-roster${query ? `?${query}` : ''}`} />
}

function App() {
  return (
    <ThemeProvider theme={appTheme}>
      <CssBaseline />
      <BrowserRouter basename={getRouterBasename()}>
        <UserDataProvider>
          <Box
            component="main"
            sx={{
              width: {
                xs: 'min(100% - 20px, 1680px)',
                md: 'min(1680px, calc(100% - 32px))',
              },
              mx: 'auto',
              py: { xs: 1, md: 1.5 },
              pb: 6,
            }}
          >
            <Routes>
              <Route path="region-roster" element={<RegionRosterPage />} />
              <Route path="*" element={<RedirectToRoster />} />
            </Routes>
          </Box>
        </UserDataProvider>
      </BrowserRouter>
    </ThemeProvider>
  )
}

export default App
