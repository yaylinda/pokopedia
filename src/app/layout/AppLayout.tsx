import Box from '@mui/material/Box'
import { Outlet } from 'react-router-dom'
import { AppHeader } from './AppHeader'

export function AppLayout() {
  return (
    <Box sx={{ minHeight: '100vh' }}>
      <Box
        component="a"
        href="#main-content"
        sx={{
          backgroundColor: 'primary.dark',
          borderRadius: 1,
          color: 'primary.contrastText',
          left: 16,
          px: 2,
          py: 1,
          position: 'fixed',
          top: 12,
          transform: 'translateY(-160%)',
          transition: 'transform 140ms ease-out',
          zIndex: 'var(--z-skip-link)',
          '&:focus-visible': {
            outline: '3px solid oklch(0.78 0.15 82)',
            outlineOffset: 2,
            transform: 'translateY(0)',
          },
        }}
      >
        Skip to roster
      </Box>

      <AppHeader />

      <Box
        component="main"
        id="main-content"
        sx={{
          mx: 'auto',
          px: { xs: 1.25, sm: 2, lg: 3 },
          py: { xs: 2, sm: 3, lg: 4 },
          width: 'min(100%, 1680px)',
        }}
        tabIndex={-1}
      >
        <Outlet />
      </Box>
    </Box>
  )
}
