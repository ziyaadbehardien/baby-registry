import PropTypes from 'prop-types';

import { Box, LinearProgress, Typography } from '@mui/material';

import { tones } from 'assets/theme';

const COLORS = {
  primary: { background: tones.primary[90], accent: tones.primary[40] },
  secondary: { background: tones.secondary[90], accent: tones.secondary[40] },
};

/** Metric card from ui-specs/specs/ui/components.md, with an optional progress bar. */
const TMetricBlock = ({ title, value, icon, color = 'primary', progress }) => {
  const palette = COLORS[color];

  return (
    <Box
      sx={{
        background: palette.background,
        borderRadius: '1.5rem',
        p: 2,
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        flex: 1,
        minWidth: 0,
      }}
    >
      <Box
        aria-hidden
        sx={{
          background: palette.accent,
          color: 'common.white',
          borderRadius: '50%',
          width: 44,
          height: 44,
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {icon}
      </Box>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography variant="body2" color="text.secondary">
          {title}
        </Typography>
        <Typography variant="metricTotal">{value}</Typography>
        {progress !== undefined && (
          <LinearProgress
            variant="determinate"
            value={progress}
            aria-label={title}
            sx={{
              mt: 0.5,
              height: 6,
              borderRadius: 3,
              bgcolor: 'rgba(255, 255, 255, 0.7)',
              '& .MuiLinearProgress-bar': { bgcolor: palette.accent },
            }}
          />
        )}
      </Box>
    </Box>
  );
};

TMetricBlock.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.node.isRequired,
  icon: PropTypes.node.isRequired,
  color: PropTypes.oneOf(['primary', 'secondary']),
  progress: PropTypes.number,
};

export default TMetricBlock;
