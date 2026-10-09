import PropTypes from 'prop-types';

import {
  Button,
  Card,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemText,
  Stack,
  Typography,
} from '@mui/material';

import { formatDate } from '../../utils/registry';

export const purchasePropType = PropTypes.shape({
  id: PropTypes.string.isRequired,
  itemId: PropTypes.string.isRequired,
  itemName: PropTypes.string.isRequired,
  quantity: PropTypes.number.isRequired,
  createdAt: PropTypes.string.isRequired,
  isMine: PropTypes.bool.isRequired,
  purchaserName: PropTypes.string,
  note: PropTypes.string,
});

const describePurchaser = (purchase) => {
  if (purchase.isMine) return 'You';
  return purchase.purchaserName ?? 'A guest';
};

const PurchaseList = ({ purchases, isOwner, onUndo }) => (
  <Card>
    <List disablePadding aria-label="Purchases">
      {purchases.map((purchase, index) => (
        <Stack key={purchase.id} component="li" sx={{ listStyle: 'none' }}>
          {index > 0 && <Divider component="div" />}
          <ListItem
            component="div"
            sx={{ py: 1.5, gap: 1, flexWrap: 'wrap' }}
            secondaryAction={
              (purchase.isMine || isOwner) && (
                <Button size="small" variant="text" onClick={() => onUndo(purchase)}>
                  Undo
                </Button>
              )
            }
          >
            <ListItemText
              sx={{ pr: 8 }}
              primary={
                <Stack direction="row" spacing={1} alignItems="center" useFlexGap flexWrap="wrap">
                  <Typography fontWeight={600}>{purchase.itemName}</Typography>
                  {purchase.quantity > 1 && <Chip size="small" label={`× ${purchase.quantity}`} />}
                  {purchase.isMine && <Chip size="small" color="success" label="Yours" />}
                </Stack>
              }
              secondary={
                <>
                  {describePurchaser(purchase)} · {formatDate(purchase.createdAt)}
                  {purchase.note && (
                    <Typography component="span" display="block" variant="body2" sx={{ mt: 0.5 }}>
                      “{purchase.note}”
                    </Typography>
                  )}
                </>
              }
            />
          </ListItem>
        </Stack>
      ))}
    </List>
  </Card>
);

PurchaseList.propTypes = {
  purchases: PropTypes.arrayOf(purchasePropType).isRequired,
  isOwner: PropTypes.bool.isRequired,
  onUndo: PropTypes.func.isRequired,
};

export default PurchaseList;
