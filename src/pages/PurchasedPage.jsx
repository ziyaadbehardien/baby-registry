import { useState } from 'react';

import { Stack, Typography } from '@mui/material';
import { useSnackbar } from 'notistack';

import { getErrorMessage } from '../features/api/apiSlice';
import PurchaseList from '../features/purchases/PurchaseList';
import {
  useDeletePurchaseMutation,
  useGetPurchasesQuery,
} from '../features/purchases/purchasesApiSlice';
import RegistryProgress from '../features/registry/RegistryProgress';
import { useGetItemsQuery } from '../features/registry/registryApiSlice';
import { useRole } from '../features/user/userApiSlice';

import ConfirmDialog from 'components/ConfirmDialog';
import Loader from 'components/Loader';
import PageContainer from 'components/PageContainer';

const PurchasedPage = () => {
  const { enqueueSnackbar } = useSnackbar();
  const { isOwner } = useRole();
  const { data: items = [], isLoading: isLoadingItems } = useGetItemsQuery();
  const { data: purchases = [], isLoading: isLoadingPurchases } = useGetPurchasesQuery();
  const [deletePurchase, { isLoading: isUndoing }] = useDeletePurchaseMutation();
  const [undoTarget, setUndoTarget] = useState(null);

  const handleConfirmUndo = async () => {
    try {
      await deletePurchase({ id: undoTarget.id, itemId: undoTarget.itemId }).unwrap();
      enqueueSnackbar('Purchase removed', { variant: 'success' });
    } catch (error) {
      enqueueSnackbar(getErrorMessage(error, "Couldn't undo the purchase."), { variant: 'error' });
    }
    setUndoTarget(null);
  };

  if (isLoadingItems || isLoadingPurchases) return <Loader />;

  return (
    <PageContainer>
      <Stack spacing={3}>
        <Typography variant="h3" component="h1">
          What&apos;s been bought
        </Typography>

        {items.length > 0 && <RegistryProgress items={items} />}

        {purchases.length === 0 ? (
          <Typography color="text.secondary" sx={{ textAlign: 'center', py: 6 }}>
            Nothing has been bought yet.
          </Typography>
        ) : (
          <PurchaseList purchases={purchases} isOwner={isOwner} onUndo={setUndoTarget} />
        )}

        <ConfirmDialog
          open={Boolean(undoTarget)}
          title="Undo purchase?"
          message={
            undoTarget?.isMine
              ? `This marks ${undoTarget.itemName} as still needed again.`
              : `Remove this purchase of ${undoTarget?.itemName ?? 'the item'}? It will show as still needed.`
          }
          confirmLabel="Undo purchase"
          destructive
          isLoading={isUndoing}
          onConfirm={handleConfirmUndo}
          onClose={() => setUndoTarget(null)}
        />
      </Stack>
    </PageContainer>
  );
};

export default PurchasedPage;
