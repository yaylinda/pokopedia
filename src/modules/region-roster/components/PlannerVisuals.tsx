import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import type { RegionRosterPokemon } from '../../../data/currentRegionRoster'
import type { FavoriteItem } from '../../../data/favoriteCategories'

export function PokemonPortrait({
  pokemon,
  size,
}: {
  pokemon: RegionRosterPokemon
  size: number
}) {
  return (
    <Box
      sx={{
        alignItems: 'center',
        backgroundColor: 'oklch(0.95 0.02 155)',
        borderRadius: 1,
        display: 'flex',
        flex: '0 0 auto',
        height: size,
        justifyContent: 'center',
        width: size,
      }}
    >
      {pokemon.imageUrl ? (
        <Box
          alt=""
          component="img"
          loading="lazy"
          src={pokemon.imageUrl}
          sx={{ height: size - 4, objectFit: 'contain', width: size - 4 }}
        />
      ) : (
        <Typography sx={{ fontWeight: 850 }}>{pokemon.name.charAt(0)}</Typography>
      )}
    </Box>
  )
}

export function FavoriteItemPicture({ item }: { item: FavoriteItem }) {
  return (
    <Box
      sx={{
        alignItems: 'center',
        backgroundColor: 'oklch(0.96 0.012 82)',
        borderRadius: 0.75,
        display: 'flex',
        flex: '0 0 auto',
        height: 34,
        justifyContent: 'center',
        width: 34,
      }}
    >
      {item.pictureUrl ? (
        <Box
          alt=""
          component="img"
          loading="lazy"
          src={item.pictureUrl}
          sx={{ height: 30, objectFit: 'contain', width: 30 }}
        />
      ) : (
        <Typography sx={{ fontWeight: 850 }} variant="caption">
          {item.itemName.charAt(0)}
        </Typography>
      )}
    </Box>
  )
}
