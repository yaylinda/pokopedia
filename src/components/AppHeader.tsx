import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined'
import UploadFileOutlinedIcon from '@mui/icons-material/UploadFileOutlined'
import AppBar from '@mui/material/AppBar'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Stack from '@mui/material/Stack'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import { Link } from 'react-router-dom'
import { useUserData } from '../app/userDataContext'
import { datasetStats } from '../data/pokopia'
import { formatter, percentFormatter } from '../utils/format'
import { NavigationTabs } from './NavigationTabs'

export function AppHeader() {
  const {
    exportUserData,
    importInputRef,
    importMessage,
    importUserData,
    ownedCount,
  } = useUserData()
  const totalPokemon = datasetStats.pokemon
  const completion = totalPokemon > 0 ? ownedCount / totalPokemon : 0

  return (
    <AppBar
      className="app-header"
      color="inherit"
      component="header"
      elevation={0}
      position="sticky"
    >
      <Toolbar className="app-topbar" disableGutters>
        <Typography className="app-brand" component={Link} to="/" variant="h5">
          Pokopedia
        </Typography>

        <NavigationTabs />

        <Stack
          aria-label="User data"
          className="tracker-tools"
          component="section"
          direction="row"
          spacing={1}
        >
          <Chip
            className="tracker-summary"
            label={
              <Box component="span">
                <strong>{formatter.format(ownedCount)}</strong>{' '}
                <span>{percentFormatter.format(completion)} owned</span>
                <span className="tracker-total">
                  {' '}
                  / {formatter.format(totalPokemon)} total
                </span>
              </Box>
            }
            variant="outlined"
          />
          <Stack className="header-actions" direction="row" spacing={1}>
            <Button
              size="small"
              startIcon={<FileDownloadOutlinedIcon fontSize="small" />}
              type="button"
              variant="outlined"
              onClick={exportUserData}
            >
              Export
            </Button>
            <Button
              size="small"
              startIcon={<UploadFileOutlinedIcon fontSize="small" />}
              type="button"
              variant="outlined"
              onClick={() => importInputRef.current?.click()}
            >
              Import
            </Button>
          </Stack>
          <input
            ref={importInputRef}
            className="visually-hidden"
            type="file"
            accept="application/json"
            onChange={(event) => {
              void importUserData(event.currentTarget.files?.[0])
            }}
          />
        </Stack>
      </Toolbar>

      {importMessage ? (
        <p className="status-note" role="status">
          {importMessage}
        </p>
      ) : null}
    </AppBar>
  )
}
