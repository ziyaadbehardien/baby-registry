import { useState } from 'react';
import PropTypes from 'prop-types';

import {
  Box,
  Button,
  ButtonBase,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  ImageList,
  ImageListItem,
  Stack,
  Typography,
  useMediaQuery,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

import { nurseryInspo } from './nurseryInspo';

/** Gallery of nursery inspiration photos; tapping one shows it large with previous/next. */
const NurseryInspoDialog = ({ open, theme, onClose }) => {
  const isPhone = useMediaQuery((muiTheme) => muiTheme.breakpoints.down('sm'));
  // Index of the enlarged photo, or null while showing the grid.
  const [selected, setSelected] = useState(null);
  const photo = selected === null ? null : nurseryInspo[selected];

  const step = (delta) =>
    setSelected((index) => (index + delta + nurseryInspo.length) % nurseryInspo.length);

  const handleKeyDown = (event) => {
    if (selected === null) return;
    if (event.key === 'ArrowLeft') step(-1);
    if (event.key === 'ArrowRight') step(1);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      onKeyDown={handleKeyDown}
      maxWidth="md"
      fullWidth
      fullScreen={isPhone}
      // Reopening starts from the grid again.
      slotProps={{ transition: { onExited: () => setSelected(null) } }}
    >
      <DialogTitle>
        Nursery inspiration
        <Typography variant="body2" color="text.secondary">
          {theme.title} · {theme.detail}
        </Typography>
      </DialogTitle>

      <DialogContent>
        {photo ? (
          <Stack spacing={1.5} alignItems="center">
            <Box
              component="img"
              src={photo.src}
              alt={photo.alt}
              sx={{
                display: 'block',
                maxWidth: '100%',
                maxHeight: { xs: 'calc(100svh - 260px)', sm: '65vh' },
                borderRadius: '0.75rem',
              }}
            />
            <Stack direction="row" alignItems="center" spacing={1}>
              <IconButton onClick={() => step(-1)} aria-label="Previous photo">
                <ChevronLeftIcon />
              </IconButton>
              <Typography variant="body2" color="text.secondary" aria-live="polite">
                {selected + 1} of {nurseryInspo.length}
              </Typography>
              <IconButton onClick={() => step(1)} aria-label="Next photo">
                <ChevronRightIcon />
              </IconButton>
            </Stack>
          </Stack>
        ) : (
          <ImageList variant="masonry" cols={isPhone ? 2 : 3} gap={8} sx={{ m: 0 }}>
            {nurseryInspo.map(({ src, alt }, index) => (
              <ImageListItem key={src}>
                <ButtonBase
                  onClick={() => setSelected(index)}
                  aria-label={`Enlarge: ${alt}`}
                  sx={{
                    display: 'block',
                    width: '100%',
                    borderRadius: '0.75rem',
                    overflow: 'hidden',
                  }}
                >
                  <Box
                    component="img"
                    src={src}
                    alt=""
                    loading="lazy"
                    sx={{ display: 'block', width: '100%' }}
                  />
                </ButtonBase>
              </ImageListItem>
            ))}
          </ImageList>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        {photo && (
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => setSelected(null)}
            sx={{ mr: 'auto' }}
          >
            All photos
          </Button>
        )}
        <Button variant="contained" onClick={onClose}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

NurseryInspoDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  theme: PropTypes.shape({
    title: PropTypes.string.isRequired,
    detail: PropTypes.string.isRequired,
  }).isRequired,
  onClose: PropTypes.func.isRequired,
};

export default NurseryInspoDialog;
