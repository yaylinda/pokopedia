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
        ':root': {
          '--space-xs': '4px',
          '--space-sm': '8px',
          '--space-md': '12px',
          '--space-lg': '16px',
          '--space-xl': '24px',
          '--space-2xl': '32px',
          '--space-3xl': '48px',
          '--z-sticky': '200',
          '--z-skip-link': '700',
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
            'linear-gradient(180deg, oklch(0.985 0.008 155) 0%, oklch(0.955 0.015 155) 100%)',
          fontKerning: 'normal',
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
  },
})
