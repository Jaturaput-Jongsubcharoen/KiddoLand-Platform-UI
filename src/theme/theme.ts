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
    fontFamily:
      '"SF Pro Display", "SF Pro Text", "Nunito", "Segoe UI", -apple-system, BlinkMacSystemFont, "Helvetica Neue", sans-serif',
    h1: {
      fontFamily: '"Nunito", sans-serif',
      fontWeight: 700,
      fontSize: '2.6rem',
      letterSpacing: '-0.02em',
    },
    h2: {
      fontFamily: '"Nunito", sans-serif',
      fontWeight: 700,
      fontSize: '2.1rem',
      letterSpacing: '-0.02em',
    },
    h3: {
      fontFamily: '"Nunito", sans-serif',
      fontWeight: 600,
      fontSize: '1.8rem',
    },
    h4: {
      fontFamily: '"Nunito", sans-serif',
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
          backgroundColor: '#EAF1FB',
          backgroundImage:
            'radial-gradient(circle at 12% 14%, rgba(120, 166, 255, 0.28) 0, transparent 36%),' +
            'radial-gradient(circle at 86% 10%, rgba(126, 243, 219, 0.22) 0, transparent 34%),' +
            'radial-gradient(circle at 80% 80%, rgba(249, 191, 147, 0.20) 0, transparent 40%),' +
            'linear-gradient(150deg, #F7FAFF 0%, #ECF4FF 45%, #EEF8F7 100%)',
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
          background:
            'linear-gradient(125deg, rgba(28, 87, 201, 0.74) 0%, rgba(32, 182, 170, 0.68) 100%)',
          backdropFilter: 'blur(14px) saturate(150%)',
          WebkitBackdropFilter: 'blur(14px) saturate(150%)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.35)',
          color: '#FFFFFF',
          boxShadow: '0 14px 36px rgba(15, 23, 42, 0.18)',
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
          background: 'linear-gradient(160deg, rgba(255,255,255,0.42) 0%, rgba(255,255,255,0.2) 100%)',
          backdropFilter: 'blur(20px) saturate(155%)',
          WebkitBackdropFilter: 'blur(20px) saturate(155%)',
          border: '1px solid rgba(255,255,255,0.5)',
          boxShadow: '0 10px 28px rgba(15, 23, 42, 0.14)',
          transition: 'all 0.25s ease',
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          background: 'linear-gradient(160deg, rgba(255,255,255,0.48) 0%, rgba(241,247,255,0.3) 100%)',
          border: '1px solid rgba(255,255,255,0.54)',
          backdropFilter: 'blur(24px) saturate(165%)',
          WebkitBackdropFilter: 'blur(24px) saturate(165%)',
          boxShadow: '0 22px 48px rgba(15, 23, 42, 0.22)',
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
