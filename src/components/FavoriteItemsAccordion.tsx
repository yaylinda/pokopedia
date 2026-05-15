import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded'
import type { ElementType } from 'react'
import Accordion from '@mui/material/Accordion'
import AccordionDetails from '@mui/material/AccordionDetails'
import AccordionSummary from '@mui/material/AccordionSummary'
import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
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
      }}
    >
      <AccordionSummary
        expandIcon={<ExpandMoreRoundedIcon />}
        sx={{
          minHeight: 0,
          px: 1.25,
          py: 0.75,
          '& .MuiAccordionSummary-content': {
            alignItems: 'center',
            display: 'grid',
            gap: 0.75,
            gridTemplateColumns: 'minmax(0, 1fr) auto',
            my: 0,
          },
        }}
      >
        <Box sx={{ minWidth: 0 }}>
          <Typography component="strong" noWrap>
            {favorite.name}
          </Typography>
          {helperText ? (
            <Typography color="text.secondary" component="p" variant="caption">
              {helperText}
            </Typography>
          ) : null}
        </Box>
        <Chip
          label={favoriteItemCountLabel(favorite)}
          size="small"
          variant="outlined"
          sx={{ justifySelf: 'end' }}
        />
      </AccordionSummary>
      <AccordionDetails sx={{ px: 1.25, pb: 1.25, pt: 0 }}>
        {favorite.items.length > 0 ? (
          <Box
            component="ul"
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 0.75,
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
  return (
    <Box
      component={component}
      sx={{
        alignItems: 'center',
        border: 1,
        borderColor: 'divider',
        borderRadius: 999,
        display: 'inline-flex',
        gap: 0.75,
        listStyle: component === 'li' ? 'none' : undefined,
        maxWidth: '100%',
        minHeight: 30,
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
    </Box>
  )
}
