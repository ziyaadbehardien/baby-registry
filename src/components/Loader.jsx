import PropTypes from 'prop-types';

import { Box, CircularProgress } from '@mui/material';

const Loader = ({ fullPage = false }) => (
  <Box
    role="status"
    aria-label="Loading"
    sx={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      py: 6,
      minHeight: fullPage ? '100vh' : undefined,
    }}
  >
    <CircularProgress color="primary" />
  </Box>
);

Loader.propTypes = {
  fullPage: PropTypes.bool,
};

export default Loader;
