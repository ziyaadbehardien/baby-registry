import PropTypes from 'prop-types';

import { Avatar, Box, Card, Typography } from '@mui/material';
import FamilyRestroomIcon from '@mui/icons-material/FamilyRestroom';
import PhotoCameraOutlinedIcon from '@mui/icons-material/PhotoCameraOutlined';

import { useRole } from '../user/userApiSlice';
import { useGetHeroPhotoQuery } from './landingApiSlice';

import { surface, tones } from 'assets/theme';

const ARCH_RADIUS = { xs: '140px 140px 24px 24px', md: '180px 180px 28px 28px' };

/** Arched family photo with the parents' name card overlapping the bottom-left corner. */
const HeroPhoto = ({ parents, tagline }) => {
  const { isOwner } = useRole();
  const { data, isLoading } = useGetHeroPhotoQuery();

  return (
    <Box
      sx={{
        position: 'relative',
        maxWidth: { xs: 320, md: 440, xl: 520 },
        mx: 'auto',
        width: '100%',
        pb: 3,
      }}
    >
      <Box
        sx={{
          p: 1,
          bgcolor: 'common.white',
          borderRadius: ARCH_RADIUS,
          boxShadow: '0 24px 48px -24px rgba(45, 40, 37, 0.35)',
        }}
      >
        <Box
          sx={{
            aspectRatio: '4 / 5',
            borderRadius: ARCH_RADIUS,
            overflow: 'hidden',
            bgcolor: surface.band,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {data?.dataUrl ? (
            <Box
              component="img"
              src={data.dataUrl}
              alt={`${parents}, parents-to-be`}
              // Anchor the crop near the top so faces stay in frame on portrait photos.
              sx={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                objectPosition: 'center 25%',
              }}
            />
          ) : (
            !isLoading && (
              <Box sx={{ textAlign: 'center', px: 4, color: tones.neutral[50] }}>
                <PhotoCameraOutlinedIcon
                  sx={{ fontSize: 56, color: tones.secondary[70] }}
                  aria-hidden
                />
                {isOwner && (
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    Add your photo as <code>private/hero.jpg</code>
                  </Typography>
                )}
              </Box>
            )
          )}
        </Box>
      </Box>

      <Card
        sx={{
          position: 'absolute',
          left: { xs: 8, sm: -16 },
          bottom: 0,
          px: 1.5,
          py: 1,
          borderRadius: '1rem',
          display: 'flex',
          alignItems: 'center',
          gap: 1.25,
        }}
      >
        <Avatar sx={{ bgcolor: 'primary.light', color: 'primary.dark', width: 36, height: 36 }}>
          <FamilyRestroomIcon fontSize="small" />
        </Avatar>
        <div>
          <Typography variant="h4" component="p" sx={{ fontSize: '1rem', color: 'primary.dark' }}>
            {parents}
          </Typography>
          <Typography variant="caption" sx={{ fontWeight: 600 }}>
            {tagline}
          </Typography>
        </div>
      </Card>
    </Box>
  );
};

HeroPhoto.propTypes = {
  parents: PropTypes.string.isRequired,
  tagline: PropTypes.string.isRequired,
};

export default HeroPhoto;
