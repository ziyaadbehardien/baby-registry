import PropTypes from 'prop-types';

import { Box, Card, CardActionArea, Stack, Typography } from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

/**
 * Small fact card under the hero: caption, serif value, detail line and optional colour swatches.
 * With `onClick` the whole card becomes a button, and `actionLabel` tells guests what it opens.
 */
const StatCard = ({ caption, value, detail, swatches, onClick, actionLabel }) => {
  const content = (
    <>
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
      {onClick && actionLabel && (
        <Stack
          direction="row"
          alignItems="center"
          spacing={0.5}
          sx={{ mt: 'auto', pt: 1.25, color: 'primary.dark' }}
        >
          <Typography variant="body2" sx={{ fontSize: '0.8rem', fontWeight: 700 }}>
            {actionLabel}
          </Typography>
          <ArrowForwardIcon
            sx={{
              fontSize: 16,
              transition: 'transform 200ms',
              '.MuiCardActionArea-root:hover &': { transform: 'translateX(3px)' },
            }}
          />
        </Stack>
      )}
    </>
  );

  return (
    <Card sx={{ borderRadius: '1rem', flex: 1, minWidth: 0, display: 'flex' }}>
      {onClick ? (
        <CardActionArea
          onClick={onClick}
          sx={{ p: 1.75, display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}
        >
          {content}
        </CardActionArea>
      ) : (
        <Box sx={{ p: 1.75, flex: 1 }}>{content}</Box>
      )}
    </Card>
  );
};

StatCard.propTypes = {
  caption: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  detail: PropTypes.string.isRequired,
  swatches: PropTypes.arrayOf(
    PropTypes.shape({ name: PropTypes.string.isRequired, hex: PropTypes.string.isRequired })
  ),
  onClick: PropTypes.func,
  actionLabel: PropTypes.string,
};

export default StatCard;
