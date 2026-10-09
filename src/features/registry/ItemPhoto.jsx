import { useState } from 'react';
import PropTypes from 'prop-types';

import { Box } from '@mui/material';
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined';

import { surface } from 'assets/theme';

/**
 * Product photo hot-linked from the shop. `referrerPolicy="no-referrer"` avoids most shops'
 * hotlink checks; if the image still fails, a neutral placeholder is shown instead.
 */
const ItemPhoto = ({ src, alt, height = 180 }) => {
  const [failedSrc, setFailedSrc] = useState(null);
  const isUsable = src?.startsWith('https://') && failedSrc !== src;

  return (
    <Box
      sx={{
        height,
        bgcolor: surface.muted,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      }}
    >
      {isUsable ? (
        <Box
          component="img"
          src={src}
          alt={alt}
          loading="lazy"
          referrerPolicy="no-referrer"
          onError={() => setFailedSrc(src)}
          sx={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', p: 1 }}
        />
      ) : (
        <ImageOutlinedIcon sx={{ fontSize: 48, color: surface.outline }} aria-hidden />
      )}
    </Box>
  );
};

ItemPhoto.propTypes = {
  src: PropTypes.string,
  alt: PropTypes.string.isRequired,
  height: PropTypes.number,
};

export default ItemPhoto;
