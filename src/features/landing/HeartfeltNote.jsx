import PropTypes from 'prop-types';

import { Box, Card, Divider, Stack, Typography } from '@mui/material';
import Grid from '@mui/material/Grid2';

/**
 * "A heartfelt note" letter card from the design. Spans the full page width; on wide screens the
 * quote sits beside the letter so the letter's lines stay a comfortable reading length.
 */
const HeartfeltNote = ({ note, parents }) => (
  <Card component="article" sx={{ p: { xs: 3, sm: 5 } }}>
    <Stack direction="row" justifyContent="space-between" alignItems="baseline" spacing={2}>
      <Typography
        variant="caption"
        sx={{
          color: 'secondary.dark',
          fontWeight: 700,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
        }}
      >
        A heartfelt note
      </Typography>
      <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic' }}>
        From {parents}
      </Typography>
    </Stack>
    <Divider sx={{ my: 1.5 }} />

    <Grid container spacing={{ xs: 2.5, md: 6 }}>
      <Grid size={{ xs: 12, md: 5 }}>
        <Typography
          variant="h3"
          component="blockquote"
          sx={{
            m: 0,
            color: 'primary.dark',
            fontSize: { xs: '1.5rem', sm: '1.85rem', lg: '2.25rem' },
            lineHeight: 1.3,
          }}
        >
          “{note.quote}”
        </Typography>
      </Grid>

      <Grid size={{ xs: 12, md: 7 }}>
        <Box sx={{ maxWidth: '72ch' }}>
          <Stack spacing={2}>
            <Typography>{note.greeting}</Typography>
            {note.paragraphs.map((paragraph) => (
              <Typography
                key={paragraph.slice(0, 32)}
                color="text.secondary"
                sx={{ lineHeight: 1.75 }}
              >
                {paragraph}
              </Typography>
            ))}
          </Stack>

          <Typography
            variant="h4"
            component="p"
            sx={{ mt: 3, fontStyle: 'italic', fontWeight: 500, color: 'primary.dark' }}
          >
            {note.signOff}
          </Typography>
          <Typography variant="h4" component="p" sx={{ fontSize: '1.1rem', mt: 0.5 }}>
            {parents}
          </Typography>
        </Box>
      </Grid>
    </Grid>
  </Card>
);

HeartfeltNote.propTypes = {
  note: PropTypes.shape({
    quote: PropTypes.string.isRequired,
    greeting: PropTypes.string.isRequired,
    paragraphs: PropTypes.arrayOf(PropTypes.string).isRequired,
    signOff: PropTypes.string.isRequired,
  }).isRequired,
  parents: PropTypes.string.isRequired,
};

export default HeartfeltNote;
