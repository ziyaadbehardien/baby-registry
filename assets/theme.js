/**
 * MUI theme: soft nursery palette (owner's request, replacing the earlier sage/terracotta theme).
 *
 *   Primary    baby blue    #9EC3E1 → buttons/highlights use deeper shades for readable text
 *   Secondary  baby green   #A2CDB4 → captions/accents use deeper shades for readable text
 *   Tertiary   soft aqua    #9CCFD1
 *   Neutral    light, cool greys; text is a soft blue-charcoal rather than black
 *
 *   Headline   Playfair Display      Body / labels   Plus Jakarta Sans
 *
 * Each colour has a tonal palette (10 = darkest … 95 = lightest). Pastel tones (70–95) are for
 * surfaces and fills; tones 20–50 carry text and icons so contrast stays within WCAG AA.
 */
import { alpha, createTheme } from '@mui/material/styles';

export const tones = {
  primary: {
    10: '#0B2236',
    20: '#173A57',
    30: '#2A5679',
    40: '#3E6F96',
    50: '#5B8DB5',
    60: '#7BA9CD',
    70: '#9EC3E1',
    80: '#BCD7EE',
    90: '#DCEBF7',
    95: '#EEF5FB',
  },
  secondary: {
    10: '#0E2A1C',
    20: '#1D4430',
    30: '#2F5F45',
    40: '#3D6E52',
    50: '#62967A',
    60: '#80B297',
    65: '#92C0A6',
    70: '#A2CDB4',
    80: '#C3E3D0',
    90: '#E0F2E7',
    95: '#F0F9F3',
  },
  tertiary: {
    20: '#163F42',
    30: '#2A5E61',
    40: '#3F7B7E',
    50: '#5E9FA3',
    80: '#BFE3E4',
    90: '#DFF2F2',
    95: '#EFF9F9',
  },
  neutral: {
    10: '#1A232C',
    20: '#26313B',
    30: '#3E4A55',
    40: '#5A6670',
    50: '#75808A',
    60: '#929CA5',
    70: '#AFB8C0',
    80: '#CDD5DC',
    90: '#E6ECF1',
    95: '#F2F6F9',
    98: '#F9FBFD',
  },
  warning: {
    40: '#8A5A0C',
    90: '#FCF1DC',
  },
  error: {
    40: '#B3261E',
    90: '#F9DEDC',
  },
};

// Light, airy surfaces: near-white page, white cards, a baby-blue tinted band.
export const surface = {
  page: '#F7FAFC',
  band: '#E9F3FA',
  card: '#FFFFFF',
  raised: '#FFFFFF',
  outline: '#DBE5EC',
  muted: tones.neutral[95],
};

/** Side margin used by every full-width page section (20px phone → 48px large screens). */
export const pageGutter = { xs: 2.5, sm: 4, md: 5, lg: 6 };

const headlineFont = "'Playfair Display Variable', 'Playfair Display', Georgia, serif";
const bodyFont = "'Plus Jakarta Sans Variable', 'Plus Jakarta Sans', system-ui, sans-serif";

const theme = createTheme({
  palette: {
    mode: 'light',
    // main is a mid baby blue (icons, bars, focus rings); text on it is deep navy for contrast.
    primary: {
      main: tones.primary[50],
      dark: tones.primary[30],
      light: tones.primary[80],
      contrastText: tones.primary[10],
    },
    secondary: {
      main: tones.secondary[65],
      dark: tones.secondary[40],
      light: tones.secondary[90],
      contrastText: tones.secondary[10],
    },
    tertiary: {
      main: tones.tertiary[50],
      dark: tones.tertiary[30],
      light: tones.tertiary[90],
      contrastText: tones.tertiary[20],
    },
    neutral: {
      main: tones.neutral[20],
      dark: tones.neutral[10],
      light: tones.neutral[90],
      contrastText: '#FFFFFF',
    },
    success: {
      main: tones.secondary[50],
      dark: tones.secondary[40],
      light: tones.secondary[90],
      contrastText: '#FFFFFF',
    },
    warning: { main: tones.warning[40], light: tones.warning[90], contrastText: '#FFFFFF' },
    error: { main: tones.error[40], light: tones.error[90], contrastText: '#FFFFFF' },
    info: { main: tones.tertiary[50], light: tones.tertiary[90], contrastText: tones.tertiary[20] },
    background: { default: surface.page, paper: surface.card },
    text: { primary: tones.neutral[20], secondary: tones.neutral[40] },
    divider: alpha(tones.neutral[20], 0.1),
  },

  typography: {
    fontFamily: bodyFont,
    h1: { fontFamily: headlineFont, fontSize: '3rem', fontWeight: 600 },
    h2: { fontFamily: headlineFont, fontSize: '2rem', fontWeight: 600 },
    h3: { fontFamily: headlineFont, fontSize: '1.75rem', fontWeight: 600 },
    h4: { fontFamily: headlineFont, fontSize: '1.375rem', fontWeight: 600 },
    h5: { fontSize: '1.1rem', fontWeight: 700 },
    h6: { fontSize: '1rem', fontWeight: 700 },
    body1: { fontSize: '1rem' },
    body2: { fontSize: '0.875rem' },
    button: { fontWeight: 600, textTransform: 'none', letterSpacing: 0 },
    pageTitle: { fontFamily: headlineFont, fontSize: '1.375rem', fontWeight: 600 },
    metricTotal: { fontSize: '1.25rem', fontWeight: 700 },
  },

  shape: { borderRadius: 8 },

  components: {
    MuiTypography: {
      defaultProps: {
        variantMapping: { pageTitle: 'h1', metricTotal: 'p' },
      },
    },
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: { borderRadius: '0.5rem', minHeight: '2.75rem', padding: '0 1.25rem' },
        sizeSmall: { minHeight: '2rem', padding: '0 0.75rem' },
        // Soft baby-blue fill with deep navy text (white text on pastels fails contrast).
        containedPrimary: {
          backgroundColor: tones.primary[80],
          color: tones.primary[20],
          '&:hover': { backgroundColor: tones.primary[70] },
        },
        // "Outlined" in the design: neutral outline, dark text.
        outlined: ({ theme: t, ownerState }) =>
          ownerState.color === 'primary' && {
            borderColor: tones.neutral[50],
            color: t.palette.text.primary,
            '&:hover': {
              borderColor: tones.neutral[30],
              backgroundColor: alpha(tones.neutral[20], 0.04),
            },
          },
      },
      variants: [
        // Low-emphasis baby-green fill.
        {
          props: { variant: 'tonal' },
          style: {
            backgroundColor: tones.secondary[90],
            color: tones.secondary[20],
            '&:hover': { backgroundColor: tones.secondary[80] },
          },
        },
      ],
    },
    MuiIconButton: {
      // Only the default colour is softened, so color="primary" / "error" still apply.
      variants: [{ props: { color: 'default' }, style: { color: tones.neutral[30] } }],
    },
    MuiCard: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: {
          borderRadius: '1.5rem',
          backgroundColor: surface.card,
          boxShadow: '0 1px 2px rgba(38, 49, 59, 0.04), 0 8px 24px -12px rgba(38, 49, 59, 0.1)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        rounded: { borderRadius: '1.5rem' },
      },
    },
    MuiDialog: {
      styleOverrides: { paper: { borderRadius: '1.5rem', backgroundColor: surface.raised } },
    },
    MuiDialogTitle: {
      styleOverrides: {
        root: { fontFamily: headlineFont, fontWeight: 600, fontSize: '1.5rem' },
      },
    },
    MuiTextField: {
      defaultProps: { variant: 'outlined', size: 'small' },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: '0.5rem',
          backgroundColor: surface.raised,
          '& .MuiOutlinedInput-notchedOutline': { borderColor: surface.outline },
          '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: tones.neutral[50] },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: tones.primary[40] },
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: { root: { color: tones.neutral[40] } },
    },
    MuiChip: {
      styleOverrides: {
        root: { borderRadius: '0.5rem', fontWeight: 600 },
        colorPrimary: { backgroundColor: tones.primary[90], color: tones.primary[30] },
        colorSuccess: { backgroundColor: tones.secondary[90], color: tones.secondary[30] },
        colorError: { backgroundColor: tones.error[90], color: tones.error[40] },
        colorWarning: { backgroundColor: tones.warning[90], color: tones.warning[40] },
        outlined: { borderColor: surface.outline },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: { height: 8, borderRadius: 4, backgroundColor: tones.neutral[90] },
        bar: { borderRadius: 4 },
      },
    },
    MuiToggleButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          whiteSpace: 'nowrap',
          borderColor: surface.outline,
          color: tones.neutral[30],
          '&.Mui-selected': {
            backgroundColor: tones.primary[80],
            color: tones.primary[20],
            '&:hover': { backgroundColor: tones.primary[70] },
          },
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: { textTransform: 'none', fontWeight: 600, fontSize: '0.95rem' },
      },
    },
  },
});

export default theme;
