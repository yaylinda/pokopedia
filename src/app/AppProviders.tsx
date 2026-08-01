import CssBaseline from '@mui/material/CssBaseline'
import { ThemeProvider } from '@mui/material/styles'
import type { ReactNode } from 'react'
import { UserDataProvider } from '../data/UserDataProvider'
import { appTheme } from '../theme'

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider theme={appTheme}>
      <CssBaseline />
      <UserDataProvider>{children}</UserDataProvider>
    </ThemeProvider>
  )
}
