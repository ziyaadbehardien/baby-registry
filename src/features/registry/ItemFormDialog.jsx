import { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { Controller, useForm, useWatch } from 'react-hook-form';

import {
  Autocomplete,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  InputAdornment,
  MenuItem,
  Stack,
  TextField,
} from '@mui/material';
import { useSnackbar } from 'notistack';

import { getErrorMessage } from '../api/apiSlice';
import { itemPropType } from './ItemCard';
import ItemPhoto from './ItemPhoto';
import {
  useCreateItemMutation,
  useGetLinkPreviewMutation,
  useUpdateItemMutation,
} from './registryApiSlice';

const EMPTY_ITEM = {
  name: '',
  description: '',
  link: '',
  imageUrl: '',
  price: '',
  category: '',
  priority: 'medium',
  quantityWanted: 1,
};

const PRIORITY_OPTIONS = [
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low — nice to have' },
];

const toFormValues = (item) =>
  item
    ? {
        name: item.name,
        description: item.description ?? '',
        link: item.link ?? '',
        imageUrl: item.imageUrl ?? '',
        price: item.price ?? '',
        category: item.category ?? '',
        priority: item.priority,
        quantityWanted: item.quantityWanted,
      }
    : EMPTY_ITEM;

const isHttpsUrl = (value) => {
  if (!value) return true;
  try {
    return new URL(value).protocol === 'https:' || 'Link must start with https://';
  } catch {
    return 'Enter a full web address, e.g. https://shop.example.com/item';
  }
};

const ItemFormDialog = ({ open, item, categories, onClose }) => {
  const { enqueueSnackbar } = useSnackbar();
  const [createItem, { isLoading: isCreating }] = useCreateItemMutation();
  const [updateItem, { isLoading: isUpdating }] = useUpdateItemMutation();
  const isEditing = Boolean(item);
  const [getLinkPreview, { isLoading: isFetchingPhoto }] = useGetLinkPreviewMutation();
  const isSaving = isCreating || isUpdating;

  const {
    control,
    getValues,
    handleSubmit,
    reset,
    setValue,
    trigger,
    formState: { errors },
  } = useForm({ defaultValues: toFormValues(item) });
  const [link, imageUrl] = useWatch({ control, name: ['link', 'imageUrl'] });
  const autoFetchedLink = useRef(null);

  useEffect(() => {
    if (open) {
      reset(toFormValues(item));
      autoFetchedLink.current = item?.link ?? null;
    }
  }, [open, item, reset]);

  /** Fills the photo (and the name, if still empty) from the shop page. */
  const handleFetchPhoto = async () => {
    const shopLink = getValues('link').trim();
    if (!shopLink || !(await trigger('link'))) return;

    try {
      const preview = await getLinkPreview(shopLink).unwrap();
      if (preview.imageUrl) {
        setValue('imageUrl', preview.imageUrl, { shouldDirty: true, shouldValidate: true });
      } else {
        enqueueSnackbar("That page doesn't list a photo. You can paste a photo link instead.", {
          variant: 'info',
        });
      }
      if (preview.title && !getValues('name').trim()) {
        setValue('name', preview.title, { shouldDirty: true, shouldValidate: true });
      }
    } catch (error) {
      enqueueSnackbar(getErrorMessage(error, "Couldn't read that page."), { variant: 'warning' });
    }
  };

  const handleLinkBlur = (onBlur) => () => {
    onBlur();
    // Fetch automatically once per new link; the button re-fetches on demand.
    const shopLink = getValues('link').trim();
    if (shopLink && shopLink !== autoFetchedLink.current && !getValues('imageUrl')) {
      autoFetchedLink.current = shopLink;
      handleFetchPhoto();
    }
  };

  const handleSave = async (values) => {
    const body = {
      ...values,
      price: values.price === '' ? null : Number(values.price),
      quantityWanted: Number(values.quantityWanted),
    };

    try {
      if (isEditing) {
        await updateItem({ id: item.id, ...body }).unwrap();
        enqueueSnackbar('Item updated', { variant: 'success' });
      } else {
        await createItem(body).unwrap();
        enqueueSnackbar('Item added to the registry', { variant: 'success' });
      }
      onClose();
    } catch (error) {
      enqueueSnackbar(getErrorMessage(error, "Couldn't save the item."), { variant: 'error' });
    }
  };

  const minQuantity = Math.max(1, item?.quantityPurchased ?? 0);

  return (
    <Dialog open={open} onClose={isSaving ? undefined : onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit(handleSave)} noValidate>
        <DialogTitle>{isEditing ? 'Edit item' : 'Add an item'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <Controller
              name="link"
              control={control}
              rules={{ validate: isHttpsUrl }}
              render={({ field }) => (
                <TextField
                  {...field}
                  onBlur={handleLinkBlur(field.onBlur)}
                  label="Shop link"
                  type="url"
                  inputMode="url"
                  placeholder="https://"
                  autoFocus={!isEditing}
                  error={Boolean(errors.link)}
                  helperText={
                    errors.link?.message ?? 'Paste a product link to fill in the photo and name.'
                  }
                  slotProps={{
                    input: {
                      endAdornment: (
                        <InputAdornment position="end">
                          <Button
                            size="small"
                            onClick={handleFetchPhoto}
                            disabled={!link?.trim() || isFetchingPhoto}
                            sx={{ minHeight: 0, px: 1 }}
                          >
                            {isFetchingPhoto ? <CircularProgress size={18} /> : 'Get photo'}
                          </Button>
                        </InputAdornment>
                      ),
                    },
                  }}
                />
              )}
            />

            {imageUrl && (
              <Box sx={{ border: 1, borderColor: 'divider', borderRadius: 2, overflow: 'hidden' }}>
                <ItemPhoto src={imageUrl} alt="Product photo preview" height={160} />
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', px: 1, py: 0.5 }}>
                  <Button
                    size="small"
                    color="error"
                    onClick={() => setValue('imageUrl', '', { shouldDirty: true })}
                  >
                    Remove photo
                  </Button>
                </Box>
              </Box>
            )}

            <Controller
              name="imageUrl"
              control={control}
              rules={{ validate: isHttpsUrl }}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Photo link"
                  type="url"
                  inputMode="url"
                  placeholder="https://"
                  error={Boolean(errors.imageUrl)}
                  helperText={
                    errors.imageUrl?.message ??
                    'Filled in from the shop link, or paste an image address yourself.'
                  }
                />
              )}
            />

            <Controller
              name="name"
              control={control}
              rules={{
                validate: (value) => value.trim().length > 0 || 'Name is required',
                maxLength: { value: 120, message: 'Keep the name under 120 characters' },
              }}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Name"
                  required
                  error={Boolean(errors.name)}
                  helperText={errors.name?.message}
                />
              )}
            />

            <Controller
              name="description"
              control={control}
              rules={{
                maxLength: { value: 500, message: 'Keep the description under 500 characters' },
              }}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Description"
                  multiline
                  minRows={2}
                  placeholder="Colour, size, brand…"
                  error={Boolean(errors.description)}
                  helperText={errors.description?.message}
                />
              )}
            />

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <Controller
                name="price"
                control={control}
                rules={{ min: { value: 0, message: 'Price must be positive' } }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Price"
                    type="number"
                    inputMode="decimal"
                    fullWidth
                    slotProps={{
                      input: {
                        startAdornment: <InputAdornment position="start">R</InputAdornment>,
                      },
                      htmlInput: { min: 0, step: '0.01' },
                    }}
                    error={Boolean(errors.price)}
                    helperText={errors.price?.message}
                  />
                )}
              />

              <Controller
                name="quantityWanted"
                control={control}
                rules={{
                  required: 'Quantity is required',
                  min: {
                    value: minQuantity,
                    message:
                      minQuantity > 1
                        ? `${minQuantity} already bought — can't go lower`
                        : 'At least 1',
                  },
                  max: { value: 99, message: 'At most 99' },
                  validate: (value) => Number.isInteger(Number(value)) || 'Whole numbers only',
                }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Quantity wanted"
                    type="number"
                    inputMode="numeric"
                    fullWidth
                    slotProps={{ htmlInput: { min: minQuantity, max: 99, step: 1 } }}
                    error={Boolean(errors.quantityWanted)}
                    helperText={errors.quantityWanted?.message}
                  />
                )}
              />
            </Stack>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <Controller
                name="category"
                control={control}
                rules={{
                  maxLength: { value: 60, message: 'Keep the category under 60 characters' },
                }}
                render={({ field: { onChange, value, ...field } }) => (
                  <Autocomplete
                    freeSolo
                    fullWidth
                    options={categories}
                    inputValue={value}
                    onInputChange={(event, newValue) => onChange(newValue)}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        {...field}
                        label="Category"
                        placeholder="e.g. Nursery"
                        error={Boolean(errors.category)}
                        helperText={errors.category?.message}
                      />
                    )}
                  />
                )}
              />

              <Controller
                name="priority"
                control={control}
                render={({ field }) => (
                  <TextField {...field} select label="Priority" fullWidth>
                    {PRIORITY_OPTIONS.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />
            </Stack>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'flex-end', px: 3, pb: 2.5 }}>
          <Button variant="text" onClick={onClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" disabled={isSaving}>
            {isEditing ? 'Save changes' : 'Add item'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

ItemFormDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  item: itemPropType,
  categories: PropTypes.arrayOf(PropTypes.string).isRequired,
  onClose: PropTypes.func.isRequired,
};

export default ItemFormDialog;
