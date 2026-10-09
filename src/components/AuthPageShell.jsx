import PropTypes from 'prop-types';

import { Box, Typography } from '@mui/material';

import IntroCurtain from '../features/access/IntroCurtain';
import {
  MOTION,
  riseIn,
  settleZoom,
  usePrefersReducedMotion,
} from '../features/access/accessMotion';

import signInArt from 'assets/images/signin-animals.jpg';

// The portrait artwork is cropped to fit the panel. These focus points keep the stacked animals
// (bunny, bear, giraffe; right-hand side, from ~16% down) in view: on phones the banner shows
// the animals' faces, and on wide screens the bunny's ears down to the giraffe's body.
const ART_FOCUS = { xs: '50% 30%', md: '50% 45%' };

const frostedPanel = {
  bgcolor: 'rgba(255, 255, 255, 0.86)',
  backdropFilter: 'blur(6px)',
};

/**
 * Layout for the passphrase screen: the striped nursery-animals artwork fills the left half on
 * wide screens (a banner across the top on phones), with the form and POPIA privacy notice on
 * the right.
 */
const AuthPageShell = ({ children }) => {
  const reducedMotion = usePrefersReducedMotion();
  const motion = (animation) => (reducedMotion ? 'none' : animation);

  return (
    <Box
      component="main"
      sx={{
        minHeight: '100vh',
        bgcolor: 'background.default',
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
      }}
    >
      <IntroCurtain />

      <Box
        role="img"
        aria-label="Bunny, bear and giraffe stacked on a blue-and-cream striped wallpaper"
        sx={{
          minHeight: { xs: '42vh', md: '100vh' },
          position: { xs: 'relative', md: 'sticky' },
          top: 0,
          overflow: 'hidden',
          backgroundColor: 'background.default',
        }}
      >
        {/* Inner layer so the artwork can settle from a slight zoom without changing the layout. */}
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `url(${signInArt})`,
            backgroundSize: 'cover',
            backgroundPosition: ART_FOCUS,
            animation: motion(`${settleZoom} 1400ms ${MOTION.easeOut} 300ms both`),
          }}
        />
      </Box>

      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          px: { xs: 2.5, md: 5 },
          py: 4,
          // On phones the form card overlaps the bottom of the banner slightly.
          mt: { xs: -4, md: 0 },
          position: 'relative',
        }}
      >
        <Box
          sx={{
            width: '100%',
            maxWidth: 420,
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            animation: motion(`${riseIn} 600ms ${MOTION.easeOut} 650ms both`),
          }}
        >
          {children}

          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', px: 1 }}>
            Privacy: we keep only the name you enter here, which is shown with anything you mark as
            bought, and any note you add. A cookie remembers this device so you don&apos;t need the
            passphrase again. Nothing is shared with other services. Ask the parents-to-be if
            you&apos;d like your details removed.
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

AuthPageShell.propTypes = {
  children: PropTypes.node.isRequired,
};

export { frostedPanel };
export default AuthPageShell;
