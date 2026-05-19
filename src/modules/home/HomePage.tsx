import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import LinearProgress from '@mui/material/LinearProgress'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useUserData } from '../../data/userDataContext'
import { datasetStats } from '../../data/pokopia'
import { formatSavedAt, formatter, percentFormatter } from '../../utils/format'

export function HomePage() {
  const { ownedCount, userData } = useUserData()
  const totalPokemon = datasetStats.pokemon
  const completion = totalPokemon > 0 ? ownedCount / totalPokemon : 0
  const missingCount = Math.max(totalPokemon - ownedCount, 0)

  return (
    <section
      aria-labelledby="home-heading"
      id="home-panel"
      role="tabpanel"
    >
      <Box
        sx={{
          display: 'grid',
          gap: 2,
          justifySelf: 'center',
          width: 'min(920px, 100%)',
        }}
      >
        <Card component="section">
          <CardContent sx={{ display: 'grid', gap: 3, p: { xs: 2, md: 3 } }}>
            <Box>
              <Typography color="primary" component="p" variant="overline">
                Local profile
              </Typography>
              <Typography id="home-heading" component="h2" variant="h4">
                Your Pokopia notebook
              </Typography>
            </Box>
            <Typography color="text.secondary" sx={{ maxWidth: '56ch' }}>
              A quiet starting point for your local tracker. The reference-heavy
              lists live in the tabs.
            </Typography>

            <Box
              aria-label="Pokemon tracker progress"
              sx={{ display: 'grid', gap: 1 }}
            >
              <Stack direction="row" spacing={1} sx={{ alignItems: 'baseline' }}>
                <Typography component="strong" variant="h4">
                  {percentFormatter.format(completion)}
                </Typography>
                <Typography component="span" color="text.secondary">
                  complete
                </Typography>
              </Stack>
              <LinearProgress
                color="primary"
                value={completion * 100}
                variant="determinate"
                sx={{ height: 10 }}
              />
            </Box>

            <Box
              aria-label="Tracker progress"
              sx={{
                display: 'grid',
                gap: 1.5,
                gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, minmax(0, 1fr))' },
              }}
            >
              {[
                ['Owned', formatter.format(ownedCount), 'Pokemon marked in this browser'],
                ['Missing', formatter.format(missingCount), 'from the normalized roster'],
                ['Saved', formatSavedAt(userData.updatedAt), 'in this browser'],
              ].map(([label, value, note]) => (
                <Box
                  key={label}
                  sx={{
                    display: 'grid',
                    gap: 0.25,
                    minWidth: 0,
                    p: 1.5,
                  }}
                >
                  <Typography color="text.secondary" variant="body2">
                    {label}
                  </Typography>
                  <Typography
                    component="strong"
                    variant="h5"
                    sx={{ overflowWrap: 'anywhere' }}
                  >
                    {value}
                  </Typography>
                  <Typography color="text.secondary" variant="caption">
                    {note}
                  </Typography>
                </Box>
              ))}
            </Box>
          </CardContent>
        </Card>

      </Box>
    </section>
  )
}
