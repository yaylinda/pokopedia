import ApartmentRoundedIcon from '@mui/icons-material/ApartmentRounded'
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded'
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded'
import Groups2RoundedIcon from '@mui/icons-material/Groups2Rounded'
import HomeWorkRoundedIcon from '@mui/icons-material/HomeWorkRounded'
import LandscapeRoundedIcon from '@mui/icons-material/LandscapeRounded'
import SearchRoundedIcon from '@mui/icons-material/SearchRounded'
import TuneRoundedIcon from '@mui/icons-material/TuneRounded'
import Box from '@mui/material/Box'
import ButtonBase from '@mui/material/ButtonBase'
import Card from '@mui/material/Card'
import Chip from '@mui/material/Chip'
import InputAdornment from '@mui/material/InputAdornment'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { useMemo, useState } from 'react'
import {
  regionHomePlan,
  type RegionPlanHouse,
  type RegionPlanRegion,
} from '../../data/regionHomePlan'

const regionStyles: Record<
  string,
  { accent: string; tint: string; deep: string; eyebrow: string }
> = {
  'withered-wastelands': {
    accent: '#a8cb62',
    tint: '#eff6df',
    deep: '#47622d',
    eyebrow: 'Garden frontier',
  },
  'bleak-beach': {
    accent: '#6bb8b1',
    tint: '#e4f3f0',
    deep: '#276864',
    eyebrow: 'Tidal refuge',
  },
  'rocky-ridges': {
    accent: '#dc8b5d',
    tint: '#faebe2',
    deep: '#7a3f25',
    eyebrow: 'Mountain district',
  },
  'sparkling-skylands': {
    accent: '#9fa8ec',
    tint: '#eceefd',
    deep: '#454e99',
    eyebrow: 'High-altitude haven',
  },
  'palette-town': {
    accent: '#e7ba59',
    tint: '#fff4d8',
    deep: '#755814',
    eyebrow: 'Free-build commons',
  },
}

const habitatColors: Record<string, { background: string; color: string }> = {
  Bright: { background: '#fff3be', color: '#6e5311' },
  Cool: { background: '#e5ecff', color: '#3f5489' },
  Dark: { background: '#e5e0ec', color: '#514360' },
  Dry: { background: '#f7e2cf', color: '#71472d' },
  Humid: { background: '#d9f0e8', color: '#2d6352' },
  Warm: { background: '#ffe0d8', color: '#853d31' },
}

const allHabitats = Array.from(
  new Set(
    regionHomePlan.regions.flatMap((region) =>
      region.houses.map((house) => house.primaryIdealHabitat.name),
    ),
  ),
).sort()

const formatDate = (value: string) =>
  new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(`${value}T00:00:00Z`))

const averageCompatibility = (region: RegionPlanRegion) => {
  const scores = region.houses.flatMap((house) =>
    house.compatibilityScore === null ? [] : [house.compatibilityScore],
  )

  return Math.round(scores.reduce((total, score) => total + score, 0) / scores.length)
}

const scoreLabel = (score: number | null) => {
  if (score === null) return 'Solo home'
  if (score >= 80) return 'Exceptional fit'
  if (score >= 60) return 'Strong fit'
  return 'Considered fit'
}

export function RegionPlanPage() {
  const [selectedRegionId, setSelectedRegionId] = useState(
    regionHomePlan.regions[0].regionId,
  )
  const [query, setQuery] = useState('')
  const [habitat, setHabitat] = useState('all')
  const selectedRegion =
    regionHomePlan.regions.find(
      (region) => region.regionId === selectedRegionId,
    ) ?? regionHomePlan.regions[0]
  const style = regionStyles[selectedRegion.regionId]

  const visibleHouses = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase()

    return selectedRegion.houses.filter((house) => {
      const matchesHabitat =
        habitat === 'all' || house.primaryIdealHabitat.name === habitat
      const searchableText = [
        house.houseId,
        house.name,
        house.explanation,
        ...house.pokemon.flatMap((pokemon) => [
          pokemon.name,
          pokemon.idealHabitat.name,
          ...pokemon.favorites.map((favorite) => favorite.name),
          ...pokemon.specialties.map((specialty) => specialty.name),
        ]),
      ]
        .join(' ')
        .toLocaleLowerCase()

      return matchesHabitat && searchableText.includes(normalizedQuery)
    })
  }, [habitat, query, selectedRegion])

  const chooseRegion = (regionId: string) => {
    setSelectedRegionId(regionId)
    setQuery('')
    setHabitat('all')
  }

  return (
    <Box
      aria-labelledby="region-plan-heading"
      component="section"
      id="region-plan-panel"
      role="tabpanel"
      sx={{ display: 'grid', gap: { xs: 2, md: 3 } }}
    >
      <Hero />

      <Box
        aria-label="Choose a region"
        component="nav"
        sx={{
          display: 'grid',
          gap: 1.25,
          gridTemplateColumns: {
            xs: 'repeat(5, minmax(152px, 1fr))',
            lg: 'repeat(5, minmax(0, 1fr))',
          },
          mx: { xs: -1.25, md: 0 },
          overflowX: 'auto',
          px: { xs: 1.25, md: 0 },
          pb: 0.5,
          scrollbarWidth: 'thin',
        }}
      >
        {regionHomePlan.regions.map((region) => (
          <RegionButton
            isSelected={region.regionId === selectedRegion.regionId}
            key={region.regionId}
            onClick={() => chooseRegion(region.regionId)}
            region={region}
          />
        ))}
      </Box>

      <Box
        sx={{
          alignItems: 'start',
          display: 'grid',
          gap: 2,
          gridTemplateColumns: { xs: '1fr', lg: '320px minmax(0, 1fr)' },
        }}
      >
        <RegionBrief region={selectedRegion} />

        <Box sx={{ display: 'grid', gap: 1.5, minWidth: 0 }}>
          <Box
            sx={{
              alignItems: { xs: 'stretch', md: 'center' },
              display: 'flex',
              flexDirection: { xs: 'column', md: 'row' },
              gap: 1,
              justifyContent: 'space-between',
            }}
          >
            <Box>
              <Typography
                color={style.deep}
                component="p"
                sx={{ fontWeight: 800, letterSpacing: '0.08em' }}
                variant="caption"
              >
                {style.eyebrow.toUpperCase()}
              </Typography>
              <Typography component="h2" variant="h4">
                {selectedRegion.name} homes
              </Typography>
              <Typography color="text.secondary" variant="body2">
                {visibleHouses.length === selectedRegion.homeCount
                  ? `${selectedRegion.homeCount} recommendations, ordered by home ID`
                  : `${visibleHouses.length} of ${selectedRegion.homeCount} homes shown`}
              </Typography>
            </Box>

            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={1}
              sx={{ width: { xs: '100%', md: 'auto' } }}
            >
              <TextField
                aria-label={`Search homes in ${selectedRegion.name}`}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search Pokémon or skill"
                size="small"
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchRoundedIcon fontSize="small" />
                      </InputAdornment>
                    ),
                  },
                }}
                sx={{ minWidth: { md: 238 } }}
                value={query}
              />
              <Select
                aria-label="Filter homes by ideal habitat"
                onChange={(event) => setHabitat(event.target.value)}
                size="small"
                startAdornment={
                  <InputAdornment position="start">
                    <TuneRoundedIcon fontSize="small" />
                  </InputAdornment>
                }
                sx={{ minWidth: 164 }}
                value={habitat}
              >
                <MenuItem value="all">All habitats</MenuItem>
                {allHabitats.map((name) => (
                  <MenuItem key={name} value={name}>
                    {name}
                  </MenuItem>
                ))}
              </Select>
            </Stack>
          </Box>

          {visibleHouses.length > 0 ? (
            <Box
              sx={{
                display: 'grid',
                gap: 1.5,
                gridTemplateColumns: {
                  xs: '1fr',
                  md: 'repeat(2, minmax(0, 1fr))',
                  xl: 'repeat(3, minmax(0, 1fr))',
                },
              }}
            >
              {visibleHouses.map((house) => (
                <HouseCard house={house} key={house.houseId} region={selectedRegion} />
              ))}
            </Box>
          ) : (
            <Card
              sx={{
                alignItems: 'center',
                borderStyle: 'dashed',
                display: 'grid',
                justifyItems: 'center',
                minHeight: 260,
                p: 3,
                textAlign: 'center',
              }}
            >
              <SearchRoundedIcon color="disabled" sx={{ fontSize: 44 }} />
              <Typography component="h3" sx={{ mt: 1 }} variant="h6">
                No matching homes
              </Typography>
              <Typography color="text.secondary" sx={{ maxWidth: '38ch' }}>
                Try a Pokémon name, a skill like “Grow,” or a different ideal
                habitat.
              </Typography>
            </Card>
          )}
        </Box>
      </Box>
    </Box>
  )
}

function Hero() {
  return (
    <Box
      sx={{
        background:
          'radial-gradient(circle at 86% 20%, rgba(255, 218, 114, 0.25), transparent 26%), radial-gradient(circle at 72% 100%, rgba(105, 187, 165, 0.25), transparent 34%), #173c34',
        border: '1px solid rgba(255,255,255,0.12)',
        borderRadius: { xs: 3, md: 4 },
        color: '#f8f8e9',
        display: 'grid',
        gap: { xs: 3, md: 4 },
        gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 1.45fr) minmax(310px, 0.75fr)' },
        overflow: 'hidden',
        p: { xs: 2.5, sm: 4, lg: 5 },
        position: 'relative',
      }}
    >
      <Box sx={{ maxWidth: 780, position: 'relative', zIndex: 1 }}>
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 2 }}>
          <AutoAwesomeRoundedIcon sx={{ color: '#efc86d', fontSize: 20 }} />
          <Typography
            component="p"
            sx={{ color: '#cfe2d8', fontWeight: 800, letterSpacing: '0.1em' }}
            variant="caption"
          >
            REGIONAL HOME PLAN · {formatDate(regionHomePlan.generatedAt).toUpperCase()}
          </Typography>
        </Stack>
        <Typography
          component="h1"
          id="region-plan-heading"
          sx={{
            color: 'inherit',
            fontSize: { xs: '2.45rem', sm: '3.6rem', lg: '4.6rem' },
            letterSpacing: '-0.045em',
            lineHeight: 0.95,
            maxWidth: '12ch',
          }}
          variant="h1"
        >
          A home for every Pokémon.
        </Typography>
        <Typography
          sx={{
            color: '#d8e7df',
            fontSize: { xs: '1rem', md: '1.1rem' },
            lineHeight: 1.55,
            maxWidth: '62ch',
            mt: 2,
          }}
        >
          Explore a complete, reproducible plan that places every Pokopia
          resident in the region—and with the housemates—where they fit best.
        </Typography>
      </Box>

      <Box
        aria-label="Plan totals"
        sx={{
          alignContent: 'end',
          display: 'grid',
          gap: 1,
          gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
          position: 'relative',
          zIndex: 1,
        }}
      >
        {[
          [regionHomePlan.pokemonCount, 'residents', <Groups2RoundedIcon key="residents" />],
          [regionHomePlan.homeCount, 'homes', <HomeWorkRoundedIcon key="homes" />],
          [regionHomePlan.regionCount, 'regions', <LandscapeRoundedIcon key="regions" />],
          ['1–4', 'per home', <ApartmentRoundedIcon key="per-home" />],
        ].map(([value, label, icon]) => (
          <Box
            key={String(label)}
            sx={{
              backdropFilter: 'blur(8px)',
              backgroundColor: 'rgba(255,255,255,0.075)',
              border: '1px solid rgba(255,255,255,0.14)',
              borderRadius: 2,
              display: 'grid',
              gap: 1.5,
              gridTemplateColumns: 'auto 1fr',
              p: 1.5,
            }}
          >
            <Box sx={{ color: '#efc86d', pt: 0.25 }}>{icon}</Box>
            <Box>
              <Typography component="strong" sx={{ lineHeight: 1 }} variant="h5">
                {value}
              </Typography>
              <Typography sx={{ color: '#cfe2d8' }} variant="caption">
                {label}
              </Typography>
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  )
}

function RegionButton({
  isSelected,
  onClick,
  region,
}: {
  isSelected: boolean
  onClick: () => void
  region: RegionPlanRegion
}) {
  const style = regionStyles[region.regionId]

  return (
    <ButtonBase
      aria-current={isSelected ? 'page' : undefined}
      onClick={onClick}
      sx={{
        alignItems: 'stretch',
        border: '1px solid',
        borderColor: isSelected ? style.deep : 'divider',
        borderRadius: 2.5,
        boxShadow: isSelected ? `0 7px 20px ${style.accent}35` : 'none',
        display: 'grid',
        minHeight: 116,
        overflow: 'hidden',
        textAlign: 'left',
        transition: 'transform 160ms ease, box-shadow 160ms ease',
        '&:hover': { transform: 'translateY(-2px)' },
        '&:focus-visible': { outline: `3px solid ${style.accent}`, outlineOffset: 2 },
      }}
    >
      <Box sx={{ backgroundColor: style.accent, height: 8 }} />
      <Box
        sx={{
          backgroundColor: isSelected ? style.tint : 'background.paper',
          display: 'grid',
          gap: 0.75,
          p: 1.5,
        }}
      >
        <Typography component="strong" sx={{ fontWeight: 800, lineHeight: 1.15 }}>
          {region.name}
        </Typography>
        <Typography color="text.secondary" variant="caption">
          {region.pokemonCount} Pokémon · {region.homeCount} homes
        </Typography>
      </Box>
    </ButtonBase>
  )
}

function RegionBrief({ region }: { region: RegionPlanRegion }) {
  const style = regionStyles[region.regionId]
  const habitatTotal = Object.values(region.idealHabitatCounts).reduce(
    (total, count) => total + count,
    0,
  )

  return (
    <Card
      component="aside"
      sx={{
        background: `linear-gradient(160deg, ${style.tint}, #fbfcf8 62%)`,
        borderColor: `${style.accent}99`,
        display: 'grid',
        gap: 2.5,
        overflow: 'hidden',
        p: { xs: 2, md: 2.5 },
        position: { lg: 'sticky' },
        top: { lg: 72 },
      }}
    >
      <Box>
        <Typography color={style.deep} component="p" variant="overline">
          Region character
        </Typography>
        <Typography component="h3" variant="h5">
          {region.name}
        </Typography>
        <Typography color="text.secondary" sx={{ lineHeight: 1.5, mt: 1 }} variant="body2">
          {region.identity}.
        </Typography>
      </Box>

      <Box
        sx={{
          display: 'grid',
          gap: 1,
          gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
        }}
      >
        {[
          ['Residents', region.pokemonCount],
          ['Homes', region.homeCount],
          ['Avg. fit', `${averageCompatibility(region)}%`],
        ].map(([label, value]) => (
          <Box key={label}>
            <Typography color="text.secondary" variant="caption">
              {label}
            </Typography>
            <Typography component="strong" sx={{ display: 'block' }} variant="h6">
              {value}
            </Typography>
          </Box>
        ))}
      </Box>

      <Box>
        <Typography component="h4" sx={{ mb: 1 }} variant="subtitle2">
          Ideal habitat mix
        </Typography>
        <Stack spacing={1}>
          {Object.entries(region.idealHabitatCounts)
            .sort(([, left], [, right]) => right - left)
            .map(([name, count]) => (
              <Box key={name}>
                <Stack
                  direction="row"
                  sx={{ justifyContent: 'space-between', mb: 0.35 }}
                >
                  <Typography variant="caption">{name}</Typography>
                  <Typography color="text.secondary" variant="caption">
                    {count}
                  </Typography>
                </Stack>
                <Box
                  sx={{
                    backgroundColor: 'rgba(23,48,45,0.09)',
                    borderRadius: 20,
                    height: 6,
                    overflow: 'hidden',
                  }}
                >
                  <Box
                    sx={{
                      backgroundColor: habitatColors[name]?.color ?? style.deep,
                      borderRadius: 'inherit',
                      height: '100%',
                      width: `${Math.max((count / habitatTotal) * 100, 2)}%`,
                    }}
                  />
                </Box>
              </Box>
            ))}
        </Stack>
      </Box>

      <Box
        sx={{
          borderLeft: `3px solid ${style.accent}`,
          pl: 1.5,
        }}
      >
        <Typography color="text.secondary" variant="caption">
          Homes are recommended from habitat, favorite items, skills, and
          compatible housemates. Nothing is locked—you can always remix them.
        </Typography>
      </Box>
    </Card>
  )
}

function HouseCard({
  house,
  region,
}: {
  house: RegionPlanHouse
  region: RegionPlanRegion
}) {
  const style = regionStyles[region.regionId]
  const habitatStyle =
    habitatColors[house.primaryIdealHabitat.name] ?? habitatColors.Bright

  return (
    <Card
      component="article"
      sx={{
        borderColor: 'rgba(61, 83, 77, 0.2)',
        borderRadius: 2.5,
        display: 'flex',
        flexDirection: 'column',
        minWidth: 0,
        overflow: 'hidden',
        transition: 'border-color 160ms ease, transform 160ms ease, box-shadow 160ms ease',
        '&:hover': {
          borderColor: style.accent,
          boxShadow: '0 12px 30px rgba(34, 66, 57, 0.09)',
          transform: 'translateY(-2px)',
        },
      }}
    >
      <Box
        sx={{
          alignItems: 'center',
          backgroundColor: style.tint,
          borderBottom: '1px solid',
          borderColor: `${style.accent}66`,
          display: 'flex',
          justifyContent: 'space-between',
          px: 1.75,
          py: 1.25,
        }}
      >
        <Typography color={style.deep} sx={{ fontWeight: 900, letterSpacing: '0.08em' }} variant="caption">
          {house.houseId}
        </Typography>
        <Typography color={style.deep} sx={{ fontWeight: 800 }} variant="caption">
          {house.compatibilityScore === null
            ? 'Solo'
            : `${Math.round(house.compatibilityScore)}% fit`}
        </Typography>
      </Box>

      <Box sx={{ display: 'grid', flex: 1, gap: 1.5, p: 1.75 }}>
        <Box>
          <Typography component="h3" sx={{ fontSize: '1.04rem', lineHeight: 1.25 }} variant="h6">
            {house.name}
          </Typography>
          <Stack direction="row" spacing={0.75} sx={{ flexWrap: 'wrap', gap: 0.75, mt: 1 }}>
            <Chip
              label={`${house.size} ${house.size === 1 ? 'resident' : 'residents'}`}
              size="small"
              sx={{ backgroundColor: '#edf3ef' }}
            />
            <Chip
              label={house.primaryIdealHabitat.name}
              size="small"
              sx={{ backgroundColor: habitatStyle.background, color: habitatStyle.color }}
            />
          </Stack>
        </Box>

        <Box
          aria-label={`Residents of ${house.name}`}
          sx={{
            display: 'grid',
            gap: 0.75,
            gridTemplateColumns: `repeat(${house.size}, minmax(0, 1fr))`,
          }}
        >
          {house.pokemon.map((pokemon) => (
            <Box
              key={pokemon.slug}
              sx={{
                alignItems: 'center',
                backgroundColor: '#f4f7f3',
                borderRadius: 1.5,
                display: 'grid',
                gap: 0.25,
                justifyItems: 'center',
                minWidth: 0,
                p: 0.75,
                textAlign: 'center',
              }}
            >
              <Box
                alt=""
                component="img"
                loading="lazy"
                src={pokemon.imageUrl}
                sx={{ height: 58, objectFit: 'contain', width: '100%' }}
              />
              <Typography
                component="strong"
                noWrap
                sx={{ fontSize: '0.72rem', maxWidth: '100%' }}
              >
                {pokemon.name}
              </Typography>
            </Box>
          ))}
        </Box>

        <Box>
          <Typography color="text.secondary" variant="caption">
            Why this home
          </Typography>
          <Typography sx={{ lineHeight: 1.45, mt: 0.25 }} variant="body2">
            {house.explanation}
          </Typography>
        </Box>

        <Box
          component="details"
          sx={{
            borderTop: '1px solid',
            borderColor: 'divider',
            mt: 'auto',
            pt: 1.25,
            '&[open] summary': { mb: 1.25 },
          }}
        >
          <Box
            component="summary"
            sx={{
              alignItems: 'center',
              color: style.deep,
              cursor: 'pointer',
              display: 'flex',
              fontSize: '0.82rem',
              fontWeight: 800,
              justifyContent: 'space-between',
              listStyle: 'none',
              '&::-webkit-details-marker': { display: 'none' },
              '&:focus-visible': { outline: `2px solid ${style.accent}`, outlineOffset: 3 },
            }}
          >
            Assignment details
            <ArrowForwardRoundedIcon sx={{ fontSize: 18 }} />
          </Box>
          <Stack spacing={1}>
            {house.pokemon.map((pokemon) => (
              <Box
                key={pokemon.slug}
                sx={{
                  display: 'grid',
                  gap: 0.75,
                  gridTemplateColumns: 'minmax(0, 1fr) auto',
                }}
              >
                <Box sx={{ minWidth: 0 }}>
                  <Typography
                    component="strong"
                    sx={{ display: 'block' }}
                    variant="caption"
                  >
                    {pokemon.name}
                  </Typography>
                  <Typography
                    color="text.secondary"
                    sx={{ display: 'block' }}
                    variant="caption"
                  >
                    {pokemon.idealHabitat.name} ·{' '}
                    {pokemon.specialties.map((item) => item.name).join(', ') || 'No listed skill'}
                  </Typography>
                </Box>
                <Typography color={style.deep} sx={{ fontWeight: 800 }} variant="caption">
                  {Math.round(pokemon.regionFit.score)} fit
                </Typography>
              </Box>
            ))}
          </Stack>
        </Box>
      </Box>
      <Box
        aria-label={scoreLabel(house.compatibilityScore)}
        sx={{
          backgroundColor: '#e8eee9',
          height: 4,
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            backgroundColor: style.accent,
            height: '100%',
            width: `${house.compatibilityScore ?? 100}%`,
          }}
        />
      </Box>
    </Card>
  )
}
