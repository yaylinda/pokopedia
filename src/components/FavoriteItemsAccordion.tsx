import CategoryRoundedIcon from '@mui/icons-material/CategoryRounded'
import ChairRoundedIcon from '@mui/icons-material/ChairRounded'
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded'
import RouteRoundedIcon from '@mui/icons-material/RouteRounded'
import ToysRoundedIcon from '@mui/icons-material/ToysRounded'
import WeekendRoundedIcon from '@mui/icons-material/WeekendRounded'
import WidgetsRoundedIcon from '@mui/icons-material/WidgetsRounded'
import type { ElementType } from 'react'
import Accordion from '@mui/material/Accordion'
import AccordionDetails from '@mui/material/AccordionDetails'
import AccordionSummary from '@mui/material/AccordionSummary'
import Box from '@mui/material/Box'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import {
  favoriteItemCountLabel,
  type FavoriteWithItems,
} from './favoriteItems'

export function FavoriteItemsAccordion({
  favorite,
  helperText,
}: {
  favorite: FavoriteWithItems
  helperText?: string
}) {
  return (
    <Accordion
      disableGutters
      variant="outlined"
      sx={{
        '&:before': { display: 'none' },
        backgroundColor: 'rgba(251, 252, 248, 0.74)',
      }}
    >
      <AccordionSummary
        expandIcon={<ExpandMoreRoundedIcon />}
        sx={{
          minHeight: 0,
          px: 1.5,
          py: 0.85,
          '& .MuiAccordionSummary-content': {
            alignItems: 'center',
            display: 'grid',
            gap: 1,
            gridTemplateColumns: 'minmax(0, 1fr) auto',
            my: 0,
          },
        }}
      >
        <Box sx={{ display: 'grid', gap: 0.15, minWidth: 0 }}>
          <Typography component="strong" noWrap variant="h6">
            {favorite.name}
          </Typography>
          {helperText ? (
            <Typography color="text.secondary" component="p" variant="caption">
              {helperText}
            </Typography>
          ) : null}
        </Box>
        <Typography
          color="text.secondary"
          component="span"
          noWrap
          variant="caption"
          sx={{ fontWeight: 600, justifySelf: 'end' }}
        >
          {favoriteItemCountLabel(favorite)}
        </Typography>
      </AccordionSummary>
      <AccordionDetails sx={{ px: 1.5, pb: 1.5, pt: 0 }}>
        {favorite.items.length > 0 ? (
          <Box
            component="ul"
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 0.85,
              m: 0,
              maxHeight: 220,
              overflowY: 'auto',
              p: 0,
            }}
          >
            {favorite.items.map((item) => (
              <FavoriteItemChip
                item={item}
                key={`${item.itemId}-${item.sourceOrder}`}
              />
            ))}
          </Box>
        ) : (
          <Typography color="text.secondary" variant="body2">
            No items listed.
          </Typography>
        )}
      </AccordionDetails>
    </Accordion>
  )
}

export function FavoriteItemChip({
  component = 'li',
  item,
}: {
  component?: ElementType
  item: FavoriteWithItems['items'][number]
}) {
  const categoryName = item.categoryName ?? 'Uncategorized'

  return (
    <Box
      component={component}
      sx={{
        alignItems: 'center',
        border: 1,
        borderColor: 'divider',
        borderRadius: 999,
        display: 'inline-flex',
        gap: 0.65,
        listStyle: component === 'li' ? 'none' : undefined,
        maxWidth: '100%',
        minHeight: 32,
        px: 0.75,
        py: 0.25,
      }}
    >
      <Box
        alt=""
        component="img"
        src={item.pictureUrl}
        sx={{
          flex: '0 0 auto',
          height: 22,
          objectFit: 'contain',
          width: 22,
        }}
      />
      <Typography component="span" noWrap variant="caption">
        {item.itemName}
      </Typography>
      <Tooltip title={`${categoryName} item`}>
        <Box
          component="span"
          aria-label={`${categoryName} item`}
          sx={{
            alignItems: 'center',
            color: 'text.secondary',
            display: 'inline-flex',
            gap: 0.3,
            minWidth: 0,
          }}
        >
          <Box
            component="span"
            sx={{ display: 'inline-flex', fontSize: 14, lineHeight: 0 }}
          >
            {getItemCategoryIcon(categoryName)}
          </Box>
          <Typography
            color="text.secondary"
            component="span"
            noWrap
            variant="caption"
            sx={{ fontSize: '0.68rem', fontWeight: 600 }}
          >
            {categoryName}
          </Typography>
        </Box>
      </Tooltip>
    </Box>
  )
}

function getItemCategoryIcon(categoryName: string) {
  switch (categoryName) {
    case 'Decoration':
      return <ChairRoundedIcon fontSize="inherit" />
    case 'Relaxation':
      return <WeekendRoundedIcon fontSize="inherit" />
    case 'Road':
      return <RouteRoundedIcon fontSize="inherit" />
    case 'Toy':
      return <ToysRoundedIcon fontSize="inherit" />
    case 'Uncategorized':
      return <WidgetsRoundedIcon fontSize="inherit" />
    default:
      return <CategoryRoundedIcon fontSize="inherit" />
  }
}
