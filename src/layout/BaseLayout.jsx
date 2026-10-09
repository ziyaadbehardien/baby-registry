import { useDispatch, useSelector } from 'react-redux';
import { Link, Outlet, useLocation } from 'react-router';

import { Alert, AppBar, Box, Button, Stack, Tab, Tabs, Toolbar, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';

import ArrivalReveal from '../features/access/ArrivalReveal';
import { apiSlice } from '../features/api/apiSlice';
import { clearError, selectErrorStatus } from '../features/error/errorSlice';
import { useGetRegistryDetailsQuery } from '../features/landing/landingApiSlice';
import Monogram from '../features/landing/Monogram';
import { formatShortDate } from '../utils/registry';

import VisitorMenu from 'components/VisitorMenu';

import { pageGutter, surface } from 'assets/theme';

const NAV_LINKS = [
  { label: 'Our Story', path: '/' },
  { label: 'Registry Items', path: '/registry' },
  { label: 'Purchased', path: '/purchased' },
];

const ERROR_MESSAGES = {
  403: "You don't have access to do that.",
};

const capsLabel = {
  fontSize: '0.65rem',
  fontWeight: 700,
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  lineHeight: 1.4,
};

const BaseLayout = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const error = useSelector(selectErrorStatus);
  const { data: details } = useGetRegistryDetailsQuery();

  const activePath = NAV_LINKS.some((link) => link.path === location.pathname)
    ? location.pathname
    : false;

  const handleRetry = () => {
    dispatch(clearError());
    dispatch(apiSlice.util.invalidateTags(['Me', 'Items', 'Purchases']));
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <ArrivalReveal />
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          bgcolor: alpha(surface.page, 0.92),
          backdropFilter: 'blur(8px)',
          color: 'text.primary',
          borderBottom: 1,
          borderColor: 'divider',
        }}
      >
        <Box>
          <Toolbar disableGutters sx={{ gap: 2, px: pageGutter, minHeight: { xs: 64, md: 72 } }}>
            <Stack
              direction="row"
              alignItems="center"
              spacing={1.25}
              component={Link}
              to="/"
              sx={{ color: 'inherit', textDecoration: 'none', minWidth: 0 }}
            >
              <Monogram letter={details?.monogram ?? 'B'} size={40} />
              <Box sx={{ minWidth: 0 }}>
                <Typography
                  variant="pageTitle"
                  component="span"
                  sx={{ display: 'block', lineHeight: 1.1 }}
                  noWrap
                >
                  {details ? `Baby ${details.familyName}` : 'Baby Registry'}
                </Typography>
                {details && (
                  <Typography
                    component="span"
                    sx={{ ...capsLabel, display: 'block', color: 'secondary.dark' }}
                    noWrap
                  >
                    {details.parents}
                  </Typography>
                )}
              </Box>
            </Stack>

            {/* Desktop navigation: the active section sits in a soft pill, as in the design. */}
            <Stack
              component="nav"
              aria-label="Registry sections"
              direction="row"
              spacing={0.5}
              sx={{ display: { xs: 'none', md: 'flex' }, ml: 2 }}
            >
              {NAV_LINKS.map((link) => {
                const isActive = link.path === activePath;
                return (
                  <Button
                    key={link.path}
                    component={Link}
                    to={link.path}
                    aria-current={isActive ? 'page' : undefined}
                    size="small"
                    sx={{
                      borderRadius: '2rem',
                      color: isActive ? 'text.primary' : 'text.secondary',
                      bgcolor: isActive ? surface.band : 'transparent',
                      '&:hover': { bgcolor: surface.band },
                    }}
                  >
                    {link.label}
                  </Button>
                );
              })}
            </Stack>

            <Box sx={{ flexGrow: 1 }} />

            {details && (
              <Box sx={{ display: { xs: 'none', md: 'block' }, textAlign: 'right' }}>
                <Typography
                  component="span"
                  sx={{ ...capsLabel, display: 'block', color: 'secondary.dark' }}
                >
                  Due date
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {formatShortDate(details.dueDate)}
                </Typography>
              </Box>
            )}
            <Button
              variant="contained"
              component={Link}
              to="/registry"
              sx={{
                display: { xs: 'none', sm: 'inline-flex' },
                borderRadius: '2rem',
                minHeight: '2.25rem',
              }}
            >
              Send a gift
            </Button>
            <VisitorMenu />
          </Toolbar>

          {/* Mobile navigation: pill tab bar. */}
          <Box sx={{ display: { md: 'none' }, px: pageGutter, pb: 1.5 }}>
            <Tabs
              value={activePath}
              variant="fullWidth"
              aria-label="Registry sections"
              slotProps={{ indicator: { sx: { display: 'none' } } }}
              sx={{
                minHeight: 0,
                p: 0.5,
                borderRadius: '2rem',
                bgcolor: surface.band,
                '& .MuiTab-root': {
                  minHeight: 0,
                  py: 1,
                  px: 1,
                  borderRadius: '2rem',
                  color: 'text.secondary',
                  fontSize: '0.85rem',
                },
                '& .MuiTab-root.Mui-selected': {
                  bgcolor: 'primary.light',
                  color: 'primary.dark',
                },
              }}
            >
              {NAV_LINKS.map((link) => (
                <Tab
                  key={link.path}
                  label={link.label}
                  value={link.path}
                  component={Link}
                  to={link.path}
                />
              ))}
            </Tabs>
          </Box>
        </Box>
      </AppBar>

      <Box component="main">
        {error.status && (
          <Box sx={{ pt: 2, px: pageGutter }}>
            <Alert
              severity="error"
              action={
                <Button color="inherit" size="small" onClick={handleRetry}>
                  Retry
                </Button>
              }
            >
              {ERROR_MESSAGES[error.status] ??
                error.message ??
                'Something went wrong. Please try again.'}
            </Alert>
          </Box>
        )}
        <Outlet />
      </Box>
    </Box>
  );
};

export default BaseLayout;
