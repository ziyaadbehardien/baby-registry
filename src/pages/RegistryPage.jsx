import { useMemo, useState } from 'react';
import { useSelector } from 'react-redux';

import { Box, Button, Stack, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useSnackbar } from 'notistack';

import { getErrorMessage } from '../features/api/apiSlice';
import ItemCard from '../features/registry/ItemCard';
import ItemFormDialog from '../features/registry/ItemFormDialog';
import PurchaseDialog from '../features/registry/PurchaseDialog';
import RegistryFilters from '../features/registry/RegistryFilters';
import RegistryProgress from '../features/registry/RegistryProgress';
import { useDeleteItemMutation, useGetItemsQuery } from '../features/registry/registryApiSlice';
import { selectRegistryFilters } from '../features/registry/registryFiltersSlice';
import { useRole } from '../features/user/userApiSlice';

import ConfirmDialog from 'components/ConfirmDialog';
import Loader from 'components/Loader';
import PageContainer from 'components/PageContainer';

import { filterItems, getCategories } from '../utils/registry';

const RegistryPage = () => {
  const { enqueueSnackbar } = useSnackbar();
  const { isOwner } = useRole();
  const filters = useSelector(selectRegistryFilters);
  const { data: items = [], isLoading } = useGetItemsQuery();
  const [deleteItem, { isLoading: isDeleting }] = useDeleteItemMutation();

  const [purchaseItem, setPurchaseItem] = useState(null);
  const [itemForm, setItemForm] = useState({ open: false, item: null });
  const [deleteTarget, setDeleteTarget] = useState(null);

  const categories = useMemo(() => getCategories(items), [items]);
  const visibleItems = useMemo(() => filterItems(items, filters), [items, filters]);

  const handleAdd = () => setItemForm({ open: true, item: null });
  const handleEdit = (item) => setItemForm({ open: true, item });
  const handleCloseForm = () => setItemForm((current) => ({ ...current, open: false }));

  const handleConfirmDelete = async () => {
    try {
      await deleteItem(deleteTarget.id).unwrap();
      enqueueSnackbar(`${deleteTarget.name} removed`, { variant: 'success' });
    } catch (error) {
      enqueueSnackbar(getErrorMessage(error, "Couldn't remove the item."), { variant: 'error' });
    }
    setDeleteTarget(null);
  };

  if (isLoading) return <Loader />;

  return (
    <PageContainer>
      <Stack spacing={3}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
          <Typography variant="h3" component="h1">
            Our registry
          </Typography>
          {isOwner && (
            <Button variant="contained" startIcon={<AddIcon />} onClick={handleAdd}>
              Add item
            </Button>
          )}
        </Stack>

        {items.length > 0 && <RegistryProgress items={items} />}
        {items.length > 0 && <RegistryFilters categories={categories} />}

        {items.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 6 }}>
            <Typography color="text.secondary" sx={{ mb: 2 }}>
              {isOwner
                ? 'Your registry is empty. Add the first item!'
                : 'No items on the registry yet.'}
            </Typography>
            {isOwner && (
              <Button variant="contained" startIcon={<AddIcon />} onClick={handleAdd}>
                Add item
              </Button>
            )}
          </Box>
        )}

        {items.length > 0 && visibleItems.length === 0 && (
          <Typography color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
            No items match these filters.
          </Typography>
        )}

        <Box
          sx={{
            display: 'grid',
            gap: 2,
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, minmax(0, 1fr))',
              lg: 'repeat(3, minmax(0, 1fr))',
              xl: 'repeat(4, minmax(0, 1fr))',
            },
          }}
        >
          {visibleItems.map((item) => (
            <ItemCard
              key={item.id}
              item={item}
              isOwner={isOwner}
              onPurchase={setPurchaseItem}
              onEdit={handleEdit}
              onDelete={setDeleteTarget}
            />
          ))}
        </Box>

        <PurchaseDialog item={purchaseItem} onClose={() => setPurchaseItem(null)} />

        {isOwner && (
          <ItemFormDialog
            open={itemForm.open}
            item={itemForm.item}
            categories={categories}
            onClose={handleCloseForm}
          />
        )}

        <ConfirmDialog
          open={Boolean(deleteTarget)}
          title="Remove item?"
          message={
            deleteTarget?.quantityPurchased > 0
              ? `${deleteTarget.name} has ${deleteTarget.quantityPurchased} recorded purchase(s). Removing it deletes those records too.`
              : `Remove ${deleteTarget?.name ?? 'this item'} from the registry?`
          }
          confirmLabel="Remove"
          destructive
          isLoading={isDeleting}
          onConfirm={handleConfirmDelete}
          onClose={() => setDeleteTarget(null)}
        />
      </Stack>
    </PageContainer>
  );
};

export default RegistryPage;
