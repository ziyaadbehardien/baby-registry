# MUI Theme Configuration

## Theme Setup

```javascript
// src/assets/theme.js
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#011731', // tjNavyBlue
      light: '#034EA2', // tjDarkBlue
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#00C1FF', // tjLightBlue
      contrastText: '#011731',
    },
    background: {
      default: '#F2F5F9',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#000626E5',
      secondary: '#1C2938A6',
    },
    success: {
      main: '#117E11',
      light: '#16A8160D',
    },
    error: {
      main: '#D22A1E',
      light: '#D22A1E24',
    },
  },

  typography: {
    fontFamily: 'Montserrat, sans-serif',
    h1: { fontSize: '6rem', fontWeight: 400 },
    h2: { fontSize: '2rem', fontWeight: 600 },
    h3: { fontSize: '1.5rem', fontWeight: 600 },
    h4: { fontSize: '1.25rem', fontWeight: 600 },
    h5: { fontSize: '1.1rem', fontWeight: 600 },
    h6: { fontSize: '1rem', fontWeight: 600 },
    body1: { fontSize: '1rem', fontWeight: 400 },
    body2: { fontSize: '0.875rem', fontWeight: 400 },

    // Custom variants
    pageTitle: { fontSize: '1.25rem', fontWeight: 700 },
    accordionTitle: { fontSize: '1rem', fontWeight: 700 },
    accordionSubTitle: { fontSize: '0.875rem', fontWeight: 400 },
    metricTotal: { fontSize: '1.2rem', fontWeight: 700 },
    breadcrumb: { fontSize: '0.875rem', fontWeight: 400 },
    td: { fontSize: '0.875rem', fontWeight: 400 },
    tdPrimary: { fontSize: '0.875rem', fontWeight: 600 },
  },

  shape: {
    borderRadius: 8,
  },

  components: {
    // Component overrides below
  },
});

export default theme;
```

## Component Overrides

### MuiButton

```javascript
MuiButton: {
  styleOverrides: {
    root: {
      textTransform: 'none',
      fontWeight: 600,
      borderRadius: '0.6rem',
      height: '3rem',
      padding: '0 1.5rem',
    },
    containedPrimary: {
      backgroundColor: '#011731',
      '&:hover': {
        backgroundColor: '#034EA2',
      },
    },
    containedSecondary: {
      backgroundColor: '#00C1FF',
      color: '#011731',
      '&:hover': {
        backgroundColor: '#00A8E0',
      },
    },
    outlinedPrimary: {
      borderColor: '#034EA2',
      color: '#034EA2',
      '&:hover': {
        backgroundColor: '#034EA20A',
      },
    },
  },
  defaultProps: {
    disableElevation: true,
  },
},
```

### MuiTextField

```javascript
MuiTextField: {
  styleOverrides: {
    root: {
      '& .MuiOutlinedInput-root': {
        borderRadius: '0.5rem',
        backgroundColor: '#FFFFFF',
        '& fieldset': {
          borderColor: '#D9D9D9',
        },
        '&:hover fieldset': {
          borderColor: '#034EA2',
        },
        '&.Mui-focused fieldset': {
          borderColor: '#034EA2',
          borderWidth: '1px',
        },
      },
      '& .MuiInputLabel-root': {
        color: '#555B78',
      },
      '& .MuiInputBase-input::placeholder': {
        color: '#555B78',
        opacity: 1,
      },
    },
  },
  defaultProps: {
    variant: 'outlined',
    size: 'small',
  },
},
```

### MuiTableContainer

```javascript
MuiTableContainer: {
  styleOverrides: {
    root: {
      borderRadius: '16px',
      border: '1px solid #D9D9D9',
      boxShadow: 'none',
    },
  },
},
```

### MuiTableHead

```javascript
MuiTableHead: {
  styleOverrides: {
    root: {
      backgroundColor: '#FFFFFF',
      '& .MuiTableCell-head': {
        fontWeight: 600,
        color: '#000626E5',
        borderBottom: '1px solid #354E6B1A',
      },
    },
  },
},
```

### MuiTableRow

```javascript
MuiTableRow: {
  styleOverrides: {
    root: {
      '&:nth-of-type(odd)': {
        backgroundColor: '#4E749E05',
      },
      '&:hover': {
        backgroundColor: '#4E749E0A !important',
      },
      '& .MuiTableCell-root': {
        borderBottom: '1px solid #354E6B1A',
      },
    },
  },
},
```

### MuiAccordion

```javascript
MuiAccordion: {
  styleOverrides: {
    root: {
      border: '1px solid #D9D9D9',
      borderRadius: '16px !important',
      boxShadow: 'none',
      '&:before': {
        display: 'none',
      },
      '&.Mui-expanded': {
        margin: 0,
      },
    },
  },
},
```

### MuiDrawer

```javascript
MuiDrawer: {
  styleOverrides: {
    paper: {
      backgroundColor: '#011731',
      color: '#FFFFFF',
      width: 280,
    },
  },
},
```

### MuiDialog

```javascript
MuiDialog: {
  styleOverrides: {
    paper: {
      borderRadius: '16px',
      padding: '1.5rem',
    },
  },
},
```

### MuiChip

```javascript
MuiChip: {
  styleOverrides: {
    root: {
      borderRadius: '2rem',
      fontWeight: 500,
    },
    colorSuccess: {
      backgroundColor: '#16A8160D',
      color: '#117E11',
    },
    colorError: {
      backgroundColor: '#D22A1E24',
      color: '#D22A1E',
    },
  },
},
```

### MuiTooltip

```javascript
MuiTooltip: {
  styleOverrides: {
    tooltip: {
      backgroundColor: '#FFFFFF',
      color: '#000626E5',
      boxShadow: '0px 20px 24px -4px #00000014',
      borderRadius: '8px',
      padding: '0.75rem 1rem',
      fontSize: '0.875rem',
    },
    arrow: {
      color: '#FFFFFF',
    },
  },
},
```

## Using Theme in Components

### Accessing Theme

```jsx
import { useTheme } from '@mui/material/styles';

const MyComponent = () => {
  const theme = useTheme();

  return (
    <Box sx={{
      backgroundColor: theme.palette.background.paper,
      color: theme.palette.text.primary,
      borderRadius: theme.shape.borderRadius,
    }}>
      Content
    </Box>
  );
};
```

### Using sx Prop

```jsx
<Box
  sx={{
    // Theme-aware values
    bgcolor: 'background.paper',
    color: 'text.primary',
    p: 2, // theme.spacing(2) = 16px
    borderRadius: 1, // theme.shape.borderRadius = 8px

    // Responsive values
    display: { xs: 'none', md: 'flex' },

    // Pseudo-selectors
    '&:hover': {
      bgcolor: 'primary.light',
    },

    // Nested selectors
    '& .MuiTypography-root': {
      fontWeight: 600,
    },
  }}
>
  Content
</Box>
```

### Styled Components

```jsx
import { styled } from '@mui/material/styles';
import { Box } from '@mui/material';

const StyledCard = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.shape.borderRadius * 2,
  padding: theme.spacing(2),
  boxShadow: '0px 2px 4px -2px rgba(0, 0, 0, 0.08)',

  '&:hover': {
    boxShadow: '0px 4px 8px -2px rgba(0, 0, 0, 0.12)',
  },
}));

// Usage
<StyledCard>Content</StyledCard>
```

## Theme Provider Setup

```jsx
// src/main.jsx or App.jsx
import { ThemeProvider, CssBaseline } from '@mui/material';
import theme from './assets/theme';

const App = () => (
  <ThemeProvider theme={theme}>
    <CssBaseline /> {/* Normalize CSS */}
    <RouterProvider router={router} />
  </ThemeProvider>
);
```
