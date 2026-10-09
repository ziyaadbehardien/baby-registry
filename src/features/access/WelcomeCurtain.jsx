import PropTypes from 'prop-types';

import { Box, Typography } from '@mui/material';

import { dropDown, liftAway, MOTION, riseIn } from './accessMotion';

/**
 * Full-screen baby-blue curtain with a welcome message.
 * - direction "in": drops from the top after a successful passphrase (calls onDone when covered).
 * - direction "out": starts covering the app and lifts away to reveal it (calls onDone after).
 */
const WelcomeCurtain = ({ name, direction, onDone }) => (
  <Box
    role="status"
    aria-live="polite"
    onAnimationEnd={(event) => {
      // Only the curtain's own movement ends the step, not the message fading in.
      if (event.target === event.currentTarget) onDone?.();
    }}
    sx={{
      position: 'fixed',
      inset: 0,
      zIndex: 'tooltip',
      bgcolor: MOTION.curtainColor,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      px: 3,
      animation:
        direction === 'in'
          ? `${dropDown} ${MOTION.curtainMs}ms ${MOTION.ease} both`
          : `${liftAway} ${MOTION.curtainMs}ms ${MOTION.ease} 150ms both`,
    }}
  >
    <Typography
      variant="h2"
      component="p"
      sx={{
        color: MOTION.curtainText,
        textAlign: 'center',
        fontSize: { xs: '2rem', md: '2.75rem' },
        animation: direction === 'in' ? `${riseIn} 500ms ${MOTION.easeOut} 350ms both` : 'none',
      }}
    >
      Welcome{name ? `, ${name.split(' ')[0]}` : ''}
    </Typography>
  </Box>
);

WelcomeCurtain.propTypes = {
  name: PropTypes.string,
  direction: PropTypes.oneOf(['in', 'out']).isRequired,
  onDone: PropTypes.func,
};

export default WelcomeCurtain;
