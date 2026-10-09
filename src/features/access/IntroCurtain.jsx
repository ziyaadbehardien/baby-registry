import { useState } from 'react';

import { Box } from '@mui/material';

import { fadeOut, MOTION, sweepAcross, usePrefersReducedMotion } from './accessMotion';

/**
 * Page-load reveal: the screen starts under a pale cover, then a blue band sweeps left → right
 * and the cover fades, uncovering the page. Removes itself when done.
 */
const IntroCurtain = () => {
  const reducedMotion = usePrefersReducedMotion();
  const [isDone, setIsDone] = useState(false);

  if (reducedMotion || isDone) return null;

  return (
    <Box
      aria-hidden
      sx={{
        position: 'fixed',
        inset: 0,
        zIndex: 'modal',
        pointerEvents: 'none',
        overflow: 'hidden',
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          bgcolor: MOTION.coverColor,
          animation: `${fadeOut} 380ms ${MOTION.ease} 260ms both`,
        }}
      />
      <Box
        onAnimationEnd={() => setIsDone(true)}
        sx={{
          position: 'absolute',
          top: 0,
          bottom: 0,
          left: 0,
          width: '35vw',
          bgcolor: MOTION.bandColor,
          animation: `${sweepAcross} 900ms ${MOTION.ease} 120ms both`,
        }}
      />
    </Box>
  );
};

export default IntroCurtain;
