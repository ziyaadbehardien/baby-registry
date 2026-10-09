import PropTypes from 'prop-types';

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from '@mui/material';

const ConfirmDialog = ({
  open,
  title,
  message,
  confirmLabel,
  destructive = false,
  isLoading = false,
  onConfirm,
  onClose,
}) => (
  <Dialog open={open} onClose={isLoading ? undefined : onClose} maxWidth="xs" fullWidth>
    <DialogTitle>{title}</DialogTitle>
    <DialogContent>
      <Typography>{message}</Typography>
    </DialogContent>
    <DialogActions sx={{ justifyContent: 'flex-end', px: 3, pb: 2.5 }}>
      <Button variant="text" onClick={onClose} disabled={isLoading}>
        Cancel
      </Button>
      <Button
        variant="contained"
        color={destructive ? 'error' : 'primary'}
        onClick={onConfirm}
        disabled={isLoading}
      >
        {confirmLabel}
      </Button>
    </DialogActions>
  </Dialog>
);

ConfirmDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  title: PropTypes.string.isRequired,
  message: PropTypes.node.isRequired,
  confirmLabel: PropTypes.string.isRequired,
  destructive: PropTypes.bool,
  isLoading: PropTypes.bool,
  onConfirm: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default ConfirmDialog;
