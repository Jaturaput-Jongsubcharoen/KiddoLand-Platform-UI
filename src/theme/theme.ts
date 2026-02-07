import { createTheme } from '@mui/material/styles';

// KiddoLand Theme: bright, high-contrast, kid-friendly (not pastel)
export const kiddoTheme = createTheme({
  palette: {
    primary: {
      main: '#1D4ED8',
      light: '#4F7CF2',
      dark: '#153EAA',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#F97316',
      light: '#FDBA74',
      dark: '#C2410C',
      contrastText: '#1F2937',
    },
    info: {
      main: '#14B8A6',
      light: '#5EEAD4',
      dark: '#0F766E',
    },
    success: {
      main: '#16A34A',
      light: '#86EFAC',
      dark: '#166534',
    },
    warning: {
      main: '#F59E0B',
      light: '#FCD34D',
      dark: '#B45309',
    },
    error: {
      main: '#EF4444',
      light: '#FCA5A5',
      dark: '#B91C1C',
    },
    background: {
      default: '#F8FAFC',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#0F172A',
      secondary: '#334155',
    },
  },
  typography: {
    fontFamily: '"Nunito", "Fredoka", "Roboto", "Arial", sans-serif',
    h1: {
      fontFamily: '"Fredoka", "Nunito", sans-serif',
      fontWeight: 700,
      fontSize: '2.6rem',
      letterSpacing: '-0.02em',
    },
    h2: {
      fontFamily: '"Fredoka", "Nunito", sans-serif',
      fontWeight: 700,
      fontSize: '2.1rem',
      letterSpacing: '-0.02em',
    },
    h3: {
      fontFamily: '"Fredoka", "Nunito", sans-serif',
      fontWeight: 600,
      fontSize: '1.8rem',
    },
    h4: {
      fontFamily: '"Fredoka", "Nunito", sans-serif',
      fontWeight: 600,
      fontSize: '1.5rem',
    },
    h5: {
      fontFamily: '"Nunito", sans-serif',
      fontWeight: 700,
      fontSize: '1.2rem',
    },
    h6: {
      fontFamily: '"Nunito", sans-serif',
      fontWeight: 700,
      fontSize: '1rem',
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.6,
    },
    body2: {
      fontSize: '0.9rem',
      lineHeight: 1.5,
    },
    button: {
      fontWeight: 700,
      textTransform: 'none',
      fontSize: '1rem',
    },
  },
  shape: {
    borderRadius: 20,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: '#F8FAFC',
          backgroundImage:
            'radial-gradient(circle at 10% 20%, rgba(79, 124, 242, 0.16) 0, transparent 38%),' +
            'radial-gradient(circle at 85% 15%, rgba(249, 115, 22, 0.14) 0, transparent 42%),' +
            'radial-gradient(circle at 75% 85%, rgba(20, 184, 166, 0.12) 0, transparent 40%),' +
            'linear-gradient(135deg, #F9FAFB 0%, #EEF2FF 100%)',
          backgroundAttachment: 'fixed',
        },
        a: {
          color: 'inherit',
          textDecoration: 'none',
        },
        '*:focus-visible': {
          outline: '3px solid rgba(29, 78, 216, 0.45)',
          outlineOffset: 2,
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: 'linear-gradient(120deg, #1D4ED8 0%, #14B8A6 100%)',
          color: '#FFFFFF',
          boxShadow: '0 6px 20px rgba(15, 23, 42, 0.12)',
        },
      },
    },
    MuiToolbar: {
      styleOverrides: {
        root: {
          minHeight: 72,
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 24,
          padding: '12px 28px',
          fontWeight: 700,
          transition: 'all 0.25s ease',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 8px 22px rgba(15, 23, 42, 0.15)',
          },
          '&:active': {
            transform: 'translateY(0)',
          },
        },
        contained: {
          boxShadow: '0 6px 16px rgba(15, 23, 42, 0.15)',
          '&:hover': {
            boxShadow: '0 10px 26px rgba(15, 23, 42, 0.18)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 24,
          boxShadow: '0 6px 18px rgba(15, 23, 42, 0.08)',
          transition: 'all 0.25s ease',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 16,
            '& fieldset': {
              borderWidth: 2,
            },
            '&:hover fieldset': {
              borderWidth: 2,
            },
            '&.Mui-focused fieldset': {
              borderWidth: 2,
            },
          },
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        indicator: {
          height: 4,
          borderRadius: 999,
          transition: 'all 0.3s ease',
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          fontWeight: 700,
          fontSize: '1rem',
          textTransform: 'none',
          minHeight: 56,
          transition: 'all 0.25s ease',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          fontWeight: 700,
          height: 36,
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: '#0F172A',
          fontSize: '0.85rem',
          borderRadius: 12,
          padding: '10px 14px',
        },
        arrow: {
          color: '#0F172A',
        },
      },
    },
  },
});
