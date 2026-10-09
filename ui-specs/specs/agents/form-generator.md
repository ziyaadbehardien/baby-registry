# Form Generator Agent

You are a form component generator for a React application using React Hook Form and Material-UI. Follow these specifications to create consistent, validated forms.

## Context

You are creating forms for a React 18 application using:
- **Form Library**: React Hook Form v7
- **UI Framework**: Material-UI v6
- **Validation**: React Hook Form built-in + custom rules
- **Notifications**: Notistack

## Form Structure

### Basic Form Template

```jsx
// src/features/{featureName}/{FeatureName}Form.jsx
import { useEffect } from 'react';
import { useForm, Controller, useWatch } from 'react-hook-form';
import {
  Box,
  TextField,
  Button,
  Grid2,
  FormControl,
  FormLabel,
  FormHelperText,
  Autocomplete,
  Switch,
  FormControlLabel,
} from '@mui/material';
import { TButton } from 'tj-components';
import { useSnackbar } from 'notistack';

const {FeatureName}Form = ({
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
  isEdit = false,
}) => {
  const { enqueueSnackbar } = useSnackbar();

  const {
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isDirty, isValid },
  } = useForm({
    mode: 'onChange', // Validate on change
    defaultValues: {
      name: '',
      email: '',
      description: '',
      status: 'ACTIVE',
      isEnabled: true,
      category: null,
      tags: [],
      amount: '',
      ...initialData,
    },
  });

  // Reset form when initialData changes
  useEffect(() => {
    if (initialData) {
      reset(initialData);
    }
  }, [initialData, reset]);

  // Watch specific field for conditional logic
  const watchStatus = watch('status');

  // Form submission
  const handleFormSubmit = async (data) => {
    try {
      await onSubmit(data);
      enqueueSnackbar(
        isEdit ? 'Updated successfully' : 'Created successfully',
        { variant: 'success' }
      );
    } catch (error) {
      enqueueSnackbar(error.message || 'Operation failed', { variant: 'error' });
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit(handleFormSubmit)}>
      <Grid2 container spacing={3}>
        {/* Text Field */}
        <Grid2 size={{ xs: 12, md: 6 }}>
          <Controller
            name="name"
            control={control}
            rules={{
              required: 'Name is required',
              minLength: { value: 2, message: 'Minimum 2 characters' },
              maxLength: { value: 100, message: 'Maximum 100 characters' },
            }}
            render={({ field }) => (
              <TextField
                {...field}
                label="Name"
                fullWidth
                required
                error={!!errors.name}
                helperText={errors.name?.message}
                disabled={isLoading}
              />
            )}
          />
        </Grid2>

        {/* Email Field */}
        <Grid2 size={{ xs: 12, md: 6 }}>
          <Controller
            name="email"
            control={control}
            rules={{
              required: 'Email is required',
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: 'Invalid email address',
              },
            }}
            render={({ field }) => (
              <TextField
                {...field}
                label="Email"
                type="email"
                fullWidth
                required
                error={!!errors.email}
                helperText={errors.email?.message}
                disabled={isLoading}
              />
            )}
          />
        </Grid2>

        {/* Textarea */}
        <Grid2 size={{ xs: 12 }}>
          <Controller
            name="description"
            control={control}
            rules={{
              maxLength: { value: 500, message: 'Maximum 500 characters' },
            }}
            render={({ field }) => (
              <TextField
                {...field}
                label="Description"
                fullWidth
                multiline
                rows={4}
                error={!!errors.description}
                helperText={
                  errors.description?.message ||
                  `${field.value?.length || 0}/500 characters`
                }
                disabled={isLoading}
              />
            )}
          />
        </Grid2>

        {/* Select/Autocomplete */}
        <Grid2 size={{ xs: 12, md: 6 }}>
          <Controller
            name="category"
            control={control}
            rules={{ required: 'Category is required' }}
            render={({ field: { onChange, value, ...field } }) => (
              <Autocomplete
                {...field}
                options={categoryOptions}
                getOptionLabel={(option) => option.label || ''}
                value={value}
                onChange={(_, newValue) => onChange(newValue)}
                isOptionEqualToValue={(option, val) => option.value === val?.value}
                disabled={isLoading}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Category"
                    required
                    error={!!errors.category}
                    helperText={errors.category?.message}
                  />
                )}
              />
            )}
          />
        </Grid2>

        {/* Multi-select */}
        <Grid2 size={{ xs: 12, md: 6 }}>
          <Controller
            name="tags"
            control={control}
            render={({ field: { onChange, value, ...field } }) => (
              <Autocomplete
                {...field}
                multiple
                options={tagOptions}
                getOptionLabel={(option) => option.label || ''}
                value={value || []}
                onChange={(_, newValue) => onChange(newValue)}
                isOptionEqualToValue={(option, val) => option.value === val?.value}
                disabled={isLoading}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Tags"
                    error={!!errors.tags}
                    helperText={errors.tags?.message}
                  />
                )}
              />
            )}
          />
        </Grid2>

        {/* Number/Currency Field */}
        <Grid2 size={{ xs: 12, md: 6 }}>
          <Controller
            name="amount"
            control={control}
            rules={{
              required: 'Amount is required',
              min: { value: 0, message: 'Must be positive' },
              validate: (value) =>
                !isNaN(parseFloat(value)) || 'Must be a valid number',
            }}
            render={({ field }) => (
              <TextField
                {...field}
                label="Amount"
                type="number"
                fullWidth
                required
                InputProps={{
                  startAdornment: <Typography sx={{ mr: 1 }}>R</Typography>,
                }}
                error={!!errors.amount}
                helperText={errors.amount?.message}
                disabled={isLoading}
              />
            )}
          />
        </Grid2>

        {/* Switch */}
        <Grid2 size={{ xs: 12, md: 6 }}>
          <Controller
            name="isEnabled"
            control={control}
            render={({ field: { value, onChange, ...field } }) => (
              <FormControlLabel
                control={
                  <Switch
                    {...field}
                    checked={value}
                    onChange={(e) => onChange(e.target.checked)}
                    disabled={isLoading}
                  />
                }
                label="Enabled"
              />
            )}
          />
        </Grid2>

        {/* Conditional Field */}
        {watchStatus === 'PENDING' && (
          <Grid2 size={{ xs: 12 }}>
            <Controller
              name="reason"
              control={control}
              rules={{ required: 'Reason is required when status is pending' }}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Reason for Pending"
                  fullWidth
                  required
                  error={!!errors.reason}
                  helperText={errors.reason?.message}
                  disabled={isLoading}
                />
              )}
            />
          </Grid2>
        )}

        {/* Form Actions */}
        <Grid2 size={{ xs: 12 }}>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 2 }}>
            <Button
              variant="outlined"
              onClick={onCancel}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <TButton
              type="submit"
              variant="contained"
              loading={isLoading}
              disabled={!isDirty || !isValid}
            >
              {isEdit ? 'Update' : 'Create'}
            </TButton>
          </Box>
        </Grid2>
      </Grid2>
    </Box>
  );
};

export default {FeatureName}Form;
```

## Validation Rules

### Common Validation Patterns

```javascript
// Required
rules={{ required: 'This field is required' }}

// Min/Max Length
rules={{
  minLength: { value: 2, message: 'Minimum 2 characters' },
  maxLength: { value: 100, message: 'Maximum 100 characters' },
}}

// Email
rules={{
  required: 'Email is required',
  pattern: {
    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
    message: 'Invalid email address',
  },
}}

// Phone Number
rules={{
  pattern: {
    value: /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/,
    message: 'Invalid phone number',
  },
}}

// Number Range
rules={{
  min: { value: 0, message: 'Must be at least 0' },
  max: { value: 100, message: 'Cannot exceed 100' },
}}

// Custom Validation
rules={{
  validate: {
    positive: (value) => parseFloat(value) > 0 || 'Must be positive',
    lessThanMax: (value) => parseFloat(value) < 1000000 || 'Exceeds maximum',
    notEqual: (value, formValues) =>
      value !== formValues.otherField || 'Cannot be same as other field',
  },
}}

// Async Validation
rules={{
  validate: async (value) => {
    const exists = await checkIfExists(value);
    return !exists || 'This value already exists';
  },
}}
```

## Field Types

### Date Picker

```jsx
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';

<Controller
  name="startDate"
  control={control}
  rules={{ required: 'Start date is required' }}
  render={({ field: { onChange, value, ...field } }) => (
    <DatePicker
      {...field}
      label="Start Date"
      value={value ? dayjs(value) : null}
      onChange={(date) => onChange(date?.format('YYYY-MM-DD'))}
      slotProps={{
        textField: {
          fullWidth: true,
          error: !!errors.startDate,
          helperText: errors.startDate?.message,
        },
      }}
    />
  )}
/>
```

### File Upload

```jsx
<Controller
  name="file"
  control={control}
  rules={{
    required: 'File is required',
    validate: {
      size: (file) =>
        !file || file.size < 5000000 || 'File must be less than 5MB',
      type: (file) =>
        !file ||
        ['image/jpeg', 'image/png', 'application/pdf'].includes(file.type) ||
        'Invalid file type',
    },
  }}
  render={({ field: { onChange, value, ...field } }) => (
    <Box>
      <Button
        variant="outlined"
        component="label"
        startIcon={<i className="lni lni-upload-1" />}
      >
        Upload File
        <input
          {...field}
          type="file"
          hidden
          onChange={(e) => onChange(e.target.files[0])}
          accept=".jpg,.jpeg,.png,.pdf"
        />
      </Button>
      {value && (
        <Typography variant="body2" sx={{ mt: 1 }}>
          Selected: {value.name}
        </Typography>
      )}
      {errors.file && (
        <FormHelperText error>{errors.file.message}</FormHelperText>
      )}
    </Box>
  )}
/>
```

### Radio Group

```jsx
import { RadioGroup, Radio, FormControlLabel } from '@mui/material';

<Controller
  name="type"
  control={control}
  rules={{ required: 'Type is required' }}
  render={({ field }) => (
    <FormControl error={!!errors.type}>
      <FormLabel>Type</FormLabel>
      <RadioGroup {...field} row>
        <FormControlLabel value="TYPE_A" control={<Radio />} label="Type A" />
        <FormControlLabel value="TYPE_B" control={<Radio />} label="Type B" />
        <FormControlLabel value="TYPE_C" control={<Radio />} label="Type C" />
      </RadioGroup>
      {errors.type && (
        <FormHelperText>{errors.type.message}</FormHelperText>
      )}
    </FormControl>
  )}
/>
```

### Checkbox Group

```jsx
<Controller
  name="permissions"
  control={control}
  render={({ field: { onChange, value = [] } }) => (
    <FormControl>
      <FormLabel>Permissions</FormLabel>
      <FormGroup>
        {permissionOptions.map((option) => (
          <FormControlLabel
            key={option.value}
            control={
              <Checkbox
                checked={value.includes(option.value)}
                onChange={(e) => {
                  if (e.target.checked) {
                    onChange([...value, option.value]);
                  } else {
                    onChange(value.filter((v) => v !== option.value));
                  }
                }}
              />
            }
            label={option.label}
          />
        ))}
      </FormGroup>
    </FormControl>
  )}
/>
```

## Form State Management

### Using Watch

```jsx
// Watch single field
const status = watch('status');

// Watch multiple fields
const [firstName, lastName] = watch(['firstName', 'lastName']);

// Watch all fields
const allValues = watch();

// Watch with callback
useEffect(() => {
  const subscription = watch((value, { name, type }) => {
    console.log(name, type, value);
  });
  return () => subscription.unsubscribe();
}, [watch]);
```

### Using setValue

```jsx
// Set single value
setValue('field', 'value');

// Set with validation trigger
setValue('field', 'value', { shouldValidate: true });

// Set with dirty flag
setValue('field', 'value', { shouldDirty: true });

// Set multiple values
reset({ ...getValues(), field1: 'value1', field2: 'value2' });
```

### Form State Flags

```jsx
const {
  formState: {
    isDirty,          // Any field changed
    isValid,          // All validations pass
    isSubmitting,     // Form is submitting
    isSubmitted,      // Form was submitted
    isSubmitSuccessful, // Submission successful
    dirtyFields,      // Object of dirty fields
    touchedFields,    // Object of touched fields
    errors,           // Validation errors
  },
} = useForm();
```

## Form Checklist

When generating a form, ensure:

- [ ] Controller wrapper for all fields
- [ ] Validation rules defined
- [ ] Error messages displayed
- [ ] Loading/disabled states handled
- [ ] Required fields marked
- [ ] Form reset on initialData change
- [ ] Submit button disabled when invalid/pristine
- [ ] Cancel button available
- [ ] Success/error notifications
- [ ] Responsive grid layout
- [ ] Proper field types (email, number, tel)
- [ ] Character counters for text areas
- [ ] Conditional fields with watch
