import PropTypes from 'prop-types';

import { Box, Card, Stack, Typography } from '@mui/material';

/** Small fact card under the hero: caption, serif value, detail line and optional colour swatches. */
const StatCard = ({ caption, value, detail, swatches }) => (
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
    {swatches?.length > 0 && (
      <Stack
        component="ul"
        direction="row"
        spacing={0.75}
        aria-label={`${caption} colours`}
        sx={{ listStyle: 'none', m: 0, mt: 1, p: 0 }}
      >
        {swatches.map(({ name, hex }) => (
          <Box
            key={name}
            component="li"
            title={name}
            aria-label={name}
            sx={{
              width: 16,
              height: 16,
              borderRadius: '50%',
              bgcolor: hex,
              // Keeps pale colours visible against the white card.
              border: '1px solid',
              borderColor: 'divider',
            }}
          />
        ))}
      </Stack>
    )}
  </Card>
);

StatCard.propTypes = {
  caption: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  detail: PropTypes.string.isRequired,
  swatches: PropTypes.arrayOf(
    PropTypes.shape({ name: PropTypes.string.isRequired, hex: PropTypes.string.isRequired })
  ),
};

export default StatCard;
