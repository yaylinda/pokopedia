import CatchingPokemonRoundedIcon from '@mui/icons-material/CatchingPokemonRounded'
import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'

export function AppHeader() {
  return (
    <Box
      component="header"
      sx={{
        backgroundColor: 'oklch(0.985 0.008 155)',
        borderBottom: '1px solid oklch(0.87 0.025 155)',
        position: 'sticky',
        top: 0,
        zIndex: 'var(--z-sticky)',
      }}
    >
      <Box
        sx={{
          alignItems: 'center',
          display: 'flex',
          gap: { xs: 1.5, sm: 2 },
          minHeight: { xs: 56, sm: 64 },
          mx: 'auto',
          px: { xs: 1.5, sm: 2, lg: 3 },
          width: 'min(100%, 1680px)',
        }}
      >
        <Box
          aria-hidden="true"
          sx={{
            alignItems: 'center',
            backgroundColor: 'oklch(0.90 0.07 155)',
            border: '1px solid oklch(0.74 0.11 155)',
            borderRadius: '50%',
            color: 'oklch(0.38 0.10 155)',
            display: 'flex',
            height: 36,
            justifyContent: 'center',
            width: 36,
            '& svg': { fontSize: 23 },
          }}
        >
          <CatchingPokemonRoundedIcon />
        </Box>

        <Stack spacing={0} sx={{ minWidth: 0 }}>
          <Typography
            component="span"
            sx={{
              fontFamily: '"Bricolage Grotesque", sans-serif',
              fontSize: '1.125rem',
              fontWeight: 800,
              letterSpacing: '-0.01em',
              lineHeight: 1.15,
            }}
          >
            Pokopedia
          </Typography>
          <Typography
            color="text.secondary"
            noWrap
            sx={{ display: { xs: 'none', sm: 'block' } }}
            variant="caption"
          >
            Personal Pokopia planning workspace
          </Typography>
        </Stack>

        <Chip
          label="Region roster"
          size="small"
          sx={{
            backgroundColor: 'oklch(0.93 0.045 76)',
            color: 'oklch(0.38 0.09 68)',
            ml: 'auto',
          }}
        />
      </Box>
    </Box>
  )
}
