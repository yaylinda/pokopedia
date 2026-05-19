import { createTheme } from '@mui/material/styles'

export const appTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#2f735a',
      dark: '#244c3f',
      light: '#d8efe6',
      contrastText: '#f7fbf8',
    },
    secondary: {
      main: '#9f4963',
      dark: '#783549',
      light: '#f0d7dd',
      contrastText: '#fff7f8',
    },
    background: {
      default: '#edf4f2',
      paper: '#fbfcf8',
    },
    text: {
      primary: '#17302d',
      secondary: '#5f716d',
    },
    divider: '#c3d0ca',
  },
  shape: {
    borderRadius: 8,
  },
  typography: {
    fontFamily:
      '"Atkinson Hyperlegible", "Avenir Next", "Helvetica Neue", Arial, sans-serif',
    h1: {
      fontFamily:
        '"Bricolage Grotesque", "Avenir Next", "Helvetica Neue", Arial, sans-serif',
      fontWeight: 800,
      letterSpacing: 0,
    },
    h2: {
      fontFamily:
        '"Bricolage Grotesque", "Avenir Next", "Helvetica Neue", Arial, sans-serif',
      fontWeight: 800,
      letterSpacing: 0,
    },
    h3: {
      fontFamily:
        '"Bricolage Grotesque", "Avenir Next", "Helvetica Neue", Arial, sans-serif',
      fontWeight: 800,
      letterSpacing: 0,
    },
    h4: {
      fontFamily:
        '"Bricolage Grotesque", "Avenir Next", "Helvetica Neue", Arial, sans-serif',
      fontWeight: 800,
      letterSpacing: 0,
    },
    h5: {
      fontFamily:
        '"Bricolage Grotesque", "Avenir Next", "Helvetica Neue", Arial, sans-serif',
      fontWeight: 800,
      letterSpacing: 0,
    },
    h6: {
      fontFamily:
        '"Bricolage Grotesque", "Avenir Next", "Helvetica Neue", Arial, sans-serif',
      fontWeight: 800,
      letterSpacing: 0,
    },
    button: {
      fontWeight: 800,
      letterSpacing: 0,
      textTransform: 'none',
    },
  },
  components: {
    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },
      styleOverrides: {
        root: {
          minHeight: 38,
        },
      },
    },
    MuiCard: {
      defaultProps: {
        variant: 'outlined',
      },
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          borderColor: '#c3d0ca',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 700,
        },
      },
    },
    MuiCssBaseline: {
      styleOverrides: {
        '@import':
          'url("https://fonts.googleapis.com/css2?family=Atkinson+Hyperlegible:wght@400;700&family=Bricolage+Grotesque:wght@600;700;800&display=swap")',
        '*': {
          boxSizing: 'border-box',
        },
        html: {
          minHeight: '100%',
        },
        body: {
          minWidth: 320,
          minHeight: '100vh',
          margin: 0,
          padding:
            'env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left)',
          background:
            'linear-gradient(180deg, #f8fbfa 0%, #eef5f2 52%, #e6f0eb 100%)',
        },
        button: {
          cursor: 'pointer',
        },
        img: {
          display: 'block',
        },
        a: {
          color: 'inherit',
        },
        '#root': {
          minHeight: '100vh',
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          minHeight: 38,
          paddingBlock: 4,
          fontWeight: 800,
        },
      },
    },
  },
})
