import { useEffect } from 'react';
import PropTypes from 'prop-types';
import { Controller, useForm } from 'react-hook-form';

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useSnackbar } from 'notistack';

import { getErrorMessage } from '../api/apiSlice';
import { itemPropType } from './ItemCard';
import { useCreatePurchaseMutation } from './registryApiSlice';

const DEFAULT_VALUES = { quantity: 1, note: '' };

const PurchaseDialog = ({ item, onClose }) => {
  const { enqueueSnackbar } = useSnackbar();
  const [createPurchase, { isLoading }] = useCreatePurchaseMutation();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ defaultValues: DEFAULT_VALUES });

  useEffect(() => {
    if (item) reset(DEFAULT_VALUES);
  }, [item, reset]);

  if (!item) return null;

  const quantityOptions = Array.from({ length: item.quantityNeeded }, (_, index) => index + 1);

  const handleConfirm = async ({ quantity, note }) => {
    try {
      await createPurchase({ itemId: item.id, quantity: Number(quantity), note }).unwrap();
      enqueueSnackbar(`Thank you! ${item.name} is marked as bought.`, { variant: 'success' });
      onClose();
    } catch (error) {
      // 409 means someone else got there first; the list refreshes automatically.
      enqueueSnackbar(getErrorMessage(error, "Couldn't mark the item as bought."), {
        variant: 'error',
      });
      if (error?.status === 409 || error?.status === 404) onClose();
    }
  };

  return (
    <Dialog open onClose={isLoading ? undefined : onClose} maxWidth="xs" fullWidth>
      <form onSubmit={handleSubmit(handleConfirm)} noValidate>
        <DialogTitle>Mark as bought</DialogTitle>
        <DialogContent>
          <Stack spacing={2}>
            <Typography>
              <strong>{item.name}</strong>
              {item.quantityWanted > 1 && ` — ${item.quantityNeeded} still needed`}
            </Typography>

            {item.quantityNeeded > 1 && (
              <Controller
                name="quantity"
                control={control}
                render={({ field }) => (
                  <TextField {...field} select label="How many did you buy?">
                    {quantityOptions.map((count) => (
                      <MenuItem key={count} value={count}>
                        {count}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />
            )}

            <Controller
              name="note"
              control={control}
              rules={{ maxLength: { value: 200, message: 'Keep the note under 200 characters' } }}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Note (optional)"
                  placeholder="e.g. Got the grey one"
                  multiline
                  minRows={2}
                  error={Boolean(errors.note)}
                  helperText={
                    errors.note?.message ?? 'Only you and the registry owner can see this.'
                  }
                />
              )}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'flex-end', px: 3, pb: 2.5 }}>
          <Button variant="text" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" disabled={isLoading}>
            Confirm
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

PurchaseDialog.propTypes = {
  item: itemPropType,
  onClose: PropTypes.func.isRequired,
};

export default PurchaseDialog;
