import PropTypes from 'prop-types';
import { Link } from 'react-router';

import { Box, Button, Typography } from '@mui/material';

const CONTENT = {
  404: { title: 'Page not found', body: "We couldn't find that page." },
  500: { title: 'Something went wrong', body: 'Please refresh the page or try again shortly.' },
};

const ErrorPage = ({ status }) => {
  const { title, body } = CONTENT[status] ?? CONTENT[500];

  return (
    <Box
      component="main"
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
        px: 2,
        textAlign: 'center',
        bgcolor: 'background.default',
      }}
    >
      <Typography variant="h2" component="h1">
        {title}
      </Typography>
      <Typography color="text.secondary">{body}</Typography>
      <Button variant="contained" component={Link} to="/">
        Back to the registry
      </Button>
    </Box>
  );
};

ErrorPage.propTypes = {
  status: PropTypes.oneOf([404, 500]).isRequired,
};

export default ErrorPage;
