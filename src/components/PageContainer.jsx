import PropTypes from 'prop-types';

import { Box } from '@mui/material';

import { pageGutter } from 'assets/theme';

/** Full-width content area for app pages (the landing page manages its own bands). */
const PageContainer = ({ children }) => <Box sx={{ py: 3, px: pageGutter }}>{children}</Box>;

PageContainer.propTypes = {
  children: PropTypes.node.isRequired,
};

export default PageContainer;
