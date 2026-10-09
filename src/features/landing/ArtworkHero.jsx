import { Box, Button } from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';

import welcomeArt from 'assets/images/welcome-toile.jpg';

// Same artwork as the passphrase screen; the monogram plaque sits slightly left of centre.
const ART_FOCUS = '47% 45%';
// Fills the window below the sticky header (64px on phones incl. tab bar ≈ 116px; 72px desktop).
const HERO_HEIGHT = { xs: 'calc(100svh - 116px)', md: 'calc(100svh - 73px)' };

export const STORY_ANCHOR = 'our-story';

/** Full-screen opening section showing the toile monogram artwork, with a cue to scroll down. */
const ArtworkHero = () => {
  const handleScroll = () => {
    document.getElementById(STORY_ANCHOR)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <Box
      component="section"
      role="img"
      aria-label="Monogram letter B on a blue toile illustration"
      sx={{
        position: 'relative',
        minHeight: HERO_HEIGHT,
        backgroundImage: `url(${welcomeArt})`,
        backgroundSize: 'cover',
        backgroundPosition: ART_FOCUS,
        backgroundColor: 'background.default',
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
        pb: { xs: 2.5, md: 4 },
      }}
    >
      <Button
        onClick={handleScroll}
        endIcon={<KeyboardArrowDownIcon />}
        sx={{
          borderRadius: '2rem',
          bgcolor: 'rgba(255, 255, 255, 0.86)',
          backdropFilter: 'blur(6px)',
          color: 'text.primary',
          px: 2.5,
          '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.95)' },
        }}
      >
        Our story
      </Button>
    </Box>
  );
};

export default ArtworkHero;
