import PropTypes from 'prop-types';

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
} from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import EventOutlinedIcon from '@mui/icons-material/EventOutlined';
import PlaceOutlinedIcon from '@mui/icons-material/PlaceOutlined';

import { formatLongDate } from '../../utils/registry';

const ShowerDetailsDialog = ({ open, shower, onClose }) => (
  <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
    <DialogTitle>Shower gathering</DialogTitle>
    <DialogContent>
      <List disablePadding>
        <ListItem disableGutters>
          <ListItemIcon sx={{ minWidth: 40, color: 'primary.main' }}>
            <EventOutlinedIcon />
          </ListItemIcon>
          <ListItemText primary={formatLongDate(shower.date)} />
        </ListItem>
        <ListItem disableGutters>
          <ListItemIcon sx={{ minWidth: 40, color: 'primary.main' }}>
            <AccessTimeIcon />
          </ListItemIcon>
          <ListItemText primary={shower.time} />
        </ListItem>
        <ListItem disableGutters>
          <ListItemIcon sx={{ minWidth: 40, color: 'primary.main' }}>
            <PlaceOutlinedIcon />
          </ListItemIcon>
          <ListItemText primary={shower.location} />
        </ListItem>
      </List>
      {shower.details && (
        <Typography color="text.secondary" sx={{ mt: 1 }}>
          {shower.details}
        </Typography>
      )}
    </DialogContent>
    <DialogActions sx={{ px: 3, pb: 2.5 }}>
      <Button variant="contained" onClick={onClose}>
        Close
      </Button>
    </DialogActions>
  </Dialog>
);

ShowerDetailsDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  shower: PropTypes.shape({
    date: PropTypes.string.isRequired,
    time: PropTypes.string.isRequired,
    location: PropTypes.string.isRequired,
    details: PropTypes.string,
  }).isRequired,
  onClose: PropTypes.func.isRequired,
};

export default ShowerDetailsDialog;
