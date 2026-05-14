import HomeWorkRoundedIcon from '@mui/icons-material/HomeWorkRounded'
import SearchRoundedIcon from '@mui/icons-material/SearchRounded'
import TerrainRoundedIcon from '@mui/icons-material/TerrainRounded'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import LinearProgress from '@mui/material/LinearProgress'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useNavigate } from 'react-router-dom'
import { useUserData } from '../../data/userDataContext'
import { datasetStats } from '../../data/pokopia'
import { formatSavedAt, formatter, percentFormatter } from '../../utils/format'

export function HomePage() {
  const navigate = useNavigate()
  const { ownedCount, userData } = useUserData()
  const totalPokemon = datasetStats.pokemon
  const completion = totalPokemon > 0 ? ownedCount / totalPokemon : 0
  const missingCount = Math.max(totalPokemon - ownedCount, 0)

  return (
    <section
      aria-labelledby="home-heading"
      className="app-view home-grid"
      id="home-panel"
      role="tabpanel"
    >
      <Card className="home-panel home-profile" component="section">
        <CardContent className="home-card-content">
        <Typography className="eyebrow" component="p">
          Local profile
        </Typography>
        <Typography id="home-heading" component="h2" variant="h4">
          Your Pokopia notebook
        </Typography>
        <Typography className="home-lede" color="text.secondary">
          A quiet starting point for your local tracker. The reference-heavy
          lists live in the tabs.
        </Typography>

        <Box className="progress-block" aria-label="Pokemon tracker progress">
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
          />
        </Box>

        <Box className="profile-ledger" aria-label="Tracker progress">
          <Box>
            <span>Owned</span>
            <strong>{formatter.format(ownedCount)}</strong>
            <small>Pokemon marked in this browser</small>
          </Box>
          <Box>
            <span>Missing</span>
            <strong>{formatter.format(missingCount)}</strong>
            <small>from the normalized roster</small>
          </Box>
          <Box>
            <span>Saved</span>
            <strong className="saved-date">
              {formatSavedAt(userData.updatedAt)}
            </strong>
            <small>in this browser</small>
          </Box>
        </Box>
        </CardContent>
      </Card>

      <Card className="home-panel home-next" component="section" aria-labelledby="next-heading">
        <CardContent className="home-card-content">
        <div className="section-heading">
          <div>
            <Typography className="eyebrow" component="p">
              Next step
            </Typography>
            <Typography id="next-heading" component="h2" variant="h4">
              Choose a workspace
            </Typography>
          </div>
        </div>

        <div className="home-destinations">
          <Button
            className="destination-button is-primary"
            startIcon={<SearchRoundedIcon />}
            type="button"
            variant="contained"
            onClick={() => navigate('/pokemon')}
          >
            <span>
              <strong>Pokédex</strong>
              <small>Search Pokemon and update ownership.</small>
            </span>
          </Button>
          <Button
            className="destination-button"
            startIcon={<TerrainRoundedIcon />}
            type="button"
            variant="outlined"
            onClick={() => navigate('/habitats')}
          >
            <span>
              <strong>Habitats</strong>
              <small>Check components and spawn rules.</small>
            </span>
          </Button>
          <Button
            className="destination-button"
            startIcon={<HomeWorkRoundedIcon />}
            type="button"
            variant="outlined"
            onClick={() => navigate('/planner')}
          >
            <span>
              <strong>Planner</strong>
              <small>Compare house groups of four.</small>
            </span>
          </Button>
        </div>
        </CardContent>
      </Card>
    </section>
  )
}
