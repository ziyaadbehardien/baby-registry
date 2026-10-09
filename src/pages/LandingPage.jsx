import { useState } from 'react';
import { Link } from 'react-router';

import { Box, Button, Chip, Stack, Typography } from '@mui/material';
import Grid from '@mui/material/Grid2';
import CardGiftcardIcon from '@mui/icons-material/CardGiftcard';
import EventOutlinedIcon from '@mui/icons-material/EventOutlined';
import FavoriteIcon from '@mui/icons-material/Favorite';

import ArtworkHero, { STORY_ANCHOR } from '../features/landing/ArtworkHero';
import HeartfeltNote from '../features/landing/HeartfeltNote';
import HeroPhoto from '../features/landing/HeroPhoto';
import { useGetRegistryDetailsQuery } from '../features/landing/landingApiSlice';
import Monogram from '../features/landing/Monogram';
import NurseryInspoDialog from '../features/landing/NurseryInspoDialog';
import ShowerDetailsDialog from '../features/landing/ShowerDetailsDialog';
import StatCard from '../features/landing/StatCard';

import Loader from 'components/Loader';

import { describeCountdown, formatMonthYear, formatShortDate } from '../utils/registry';

import { pageGutter, surface } from 'assets/theme';

const LandingPage = () => {
  const { data: details, isLoading } = useGetRegistryDetailsQuery();
  const [isShowerOpen, setIsShowerOpen] = useState(false);
  const [isInspoOpen, setIsInspoOpen] = useState(false);

  if (isLoading) return <Loader />;
  if (!details) return null;

  return (
    <>
      <ArtworkHero />

      <Box
        component="section"
        id={STORY_ANCHOR}
        aria-labelledby="landing-headline"
        // scroll-margin keeps the sticky header from covering the top when jumping here.
        sx={{ pt: { xs: 4, md: 6 }, pb: { xs: 5, md: 7 }, scrollMarginTop: { xs: 116, md: 73 } }}
      >
        <Box sx={{ px: pageGutter }}>
          <Stack alignItems="center" spacing={1.5} sx={{ mb: { xs: 3, md: 4 } }}>
            <Monogram letter={details.monogram} />
            <Typography
              variant="caption"
              sx={{ fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase' }}
            >
              Baby {details.familyName} • {formatMonthYear(details.dueDate)}
            </Typography>
          </Stack>

          <Grid container spacing={{ xs: 4, md: 6 }} alignItems="center">
            <Grid size={{ xs: 12, md: 7 }}>
              <Chip
                icon={<FavoriteIcon sx={{ fontSize: 14 }} />}
                label="Welcoming our little one"
                size="small"
                sx={{
                  bgcolor: surface.band,
                  color: 'secondary.dark',
                  fontSize: '0.7rem',
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  '& .MuiChip-icon': { color: 'secondary.dark' },
                }}
              />
              <Typography
                id="landing-headline"
                variant="h1"
                sx={{
                  mt: 2,
                  fontSize: { xs: '2.4rem', sm: '3.2rem', md: '3.6rem' },
                  fontWeight: 700,
                  lineHeight: 1.1,
                  color: 'neutral.dark',
                }}
              >
                {details.headline}
              </Typography>
              <Typography sx={{ mt: 2.5, maxWidth: 640, lineHeight: 1.7 }}>
                {details.intro}
              </Typography>

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ mt: 3 }}>
                <StatCard
                  caption="Due date"
                  value={formatShortDate(details.dueDate)}
                  detail={describeCountdown(details.dueDate)}
                />
                <StatCard
                  caption="Nursery theme"
                  value={details.nursery.title}
                  detail={details.nursery.detail}
                  swatches={details.nursery.colors}
                  onClick={() => setIsInspoOpen(true)}
                  actionLabel="View inspiration photos"
                />
                <StatCard
                  caption="Mindful focus"
                  value={details.focus.title}
                  detail={details.focus.detail}
                />
              </Stack>

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ mt: 3 }}>
                <Button
                  variant="contained"
                  component={Link}
                  to="/registry"
                  startIcon={<CardGiftcardIcon />}
                  sx={{ borderRadius: '2rem' }}
                >
                  Browse registry items
                </Button>
                {details.shower && (
                  <Button
                    variant="tonal"
                    startIcon={<EventOutlinedIcon />}
                    onClick={() => setIsShowerOpen(true)}
                    sx={{ borderRadius: '2rem' }}
                  >
                    Shower gathering details
                  </Button>
                )}
              </Stack>
            </Grid>

            <Grid size={{ xs: 12, md: 5 }}>
              <HeroPhoto parents={details.parents} tagline={details.parentsTagline} />
            </Grid>
          </Grid>
        </Box>
      </Box>

      <Box
        component="section"
        aria-label="A heartfelt note"
        sx={{ bgcolor: surface.band, py: { xs: 4, md: 7 }, px: pageGutter }}
      >
        <HeartfeltNote note={details.note} parents={details.parents} />
      </Box>

      {details.shower && (
        <ShowerDetailsDialog
          open={isShowerOpen}
          shower={details.shower}
          onClose={() => setIsShowerOpen(false)}
        />
      )}

      <NurseryInspoDialog
        open={isInspoOpen}
        theme={details.nursery}
        onClose={() => setIsInspoOpen(false)}
      />
    </>
  );
};

export default LandingPage;
