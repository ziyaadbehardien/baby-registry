import PropTypes from 'prop-types';

import { Card, Typography } from '@mui/material';

/** Small fact card under the hero: caption, serif value, detail line. */
const StatCard = ({ caption, value, detail }) => (
  <Card sx={{ p: 1.75, borderRadius: '1rem', flex: 1, minWidth: 0 }}>
    <Typography
      variant="caption"
      component="p"
      sx={{
        color: 'secondary.dark',
        fontWeight: 700,
        letterSpacing: '0.06em',
        textTransform: 'uppercase',
      }}
    >
      {caption}
    </Typography>
    <Typography variant="h4" component="p" sx={{ fontSize: '1.2rem', mt: 0.5 }}>
      {value}
    </Typography>
    <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
      {detail}
    </Typography>
  </Card>
);

StatCard.propTypes = {
  caption: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  detail: PropTypes.string.isRequired,
};

export default StatCard;
