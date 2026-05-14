import AppBar from '@mui/material/AppBar'
import Container from '@mui/material/Container'
import Toolbar from '@mui/material/Toolbar'
import { NavigationTabs } from './NavigationTabs'

export function AppHeader() {
  return (
    <AppBar
      color="inherit"
      component="header"
      elevation={0}
      position="sticky"
      sx={{ top: 0 }}
    >
      <Container maxWidth={false} disableGutters>
        <Toolbar
          disableGutters
          sx={{
            minHeight: { xs: 48, sm: 52 },
            px: 1,
          }}
        >
          <NavigationTabs />
        </Toolbar>
      </Container>
    </AppBar>
  )
}
