import PropTypes from 'prop-types';

import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Chip,
  IconButton,
  LinearProgress,
  Link,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';

import { formatCurrency } from '../../utils/registry';

import ItemPhoto from './ItemPhoto';

const PRIORITY_CHIPS = {
  high: { label: 'High priority', color: 'primary', variant: 'filled' },
  medium: null,
  low: { label: 'Nice to have', color: 'default' },
};

export const itemPropType = PropTypes.shape({
  id: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  description: PropTypes.string,
  link: PropTypes.string,
  imageUrl: PropTypes.string,
  price: PropTypes.number,
  category: PropTypes.string,
  priority: PropTypes.oneOf(['high', 'medium', 'low']).isRequired,
  quantityWanted: PropTypes.number.isRequired,
  quantityPurchased: PropTypes.number.isRequired,
  quantityNeeded: PropTypes.number.isRequired,
});

const ItemCard = ({ item, isOwner, onPurchase, onEdit, onDelete }) => {
  const isComplete = item.quantityNeeded === 0;
  const priorityChip = PRIORITY_CHIPS[item.priority];
  const progress = (item.quantityPurchased / item.quantityWanted) * 100;
  // The API only accepts https links; re-check before rendering an href.
  const safeLink = item.link?.startsWith('https://') ? item.link : null;

  return (
    <Card
      component="article"
      aria-labelledby={`item-${item.id}-name`}
      sx={{ opacity: isComplete ? 0.75 : 1 }}
    >
      {item.imageUrl && <ItemPhoto src={item.imageUrl} alt={item.name} />}
      <CardContent sx={{ pb: 1 }}>
        <Stack direction="row" spacing={1} alignItems="flex-start" justifyContent="space-between">
          <Typography
            id={`item-${item.id}-name`}
            variant="h5"
            component="h2"
            sx={{ wordBreak: 'break-word' }}
          >
            {item.name}
          </Typography>
          {item.price !== null && (
            <Typography variant="h6" component="p" sx={{ whiteSpace: 'nowrap' }}>
              {formatCurrency(item.price)}
            </Typography>
          )}
        </Stack>

        <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" sx={{ mt: 1 }}>
          {isComplete && <Chip size="small" color="success" label="Fully bought" />}
          {priorityChip && <Chip size="small" variant="outlined" {...priorityChip} />}
          {item.category && <Chip size="small" variant="outlined" label={item.category} />}
        </Stack>

        {item.description && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mt: 1.5, whiteSpace: 'pre-line' }}
          >
            {item.description}
          </Typography>
        )}

        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" sx={{ mb: 0.5 }}>
            {item.quantityPurchased} of {item.quantityWanted} bought
            {!isComplete && item.quantityWanted > 1 && ` · ${item.quantityNeeded} still needed`}
          </Typography>
          <LinearProgress
            variant="determinate"
            value={progress}
            color={isComplete ? 'success' : 'primary'}
            aria-label={`${item.quantityPurchased} of ${item.quantityWanted} bought`}
          />
        </Box>
      </CardContent>

      <CardActions sx={{ px: 2, pb: 2, flexWrap: 'wrap', gap: 1 }}>
        <Button variant="contained" onClick={() => onPurchase(item)} disabled={isComplete}>
          {isComplete ? 'All bought' : "I've bought this"}
        </Button>
        {safeLink && (
          <Button
            variant="outlined"
            component={Link}
            href={safeLink}
            target="_blank"
            rel="noopener noreferrer"
            endIcon={<OpenInNewIcon fontSize="small" />}
          >
            View in shop
          </Button>
        )}
        {isOwner && (
          <Box sx={{ ml: 'auto !important' }}>
            <Tooltip title="Edit item">
              <IconButton
                color="primary"
                onClick={() => onEdit(item)}
                aria-label={`Edit ${item.name}`}
              >
                <EditOutlinedIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Remove item">
              <IconButton
                color="error"
                onClick={() => onDelete(item)}
                aria-label={`Remove ${item.name}`}
              >
                <DeleteOutlineIcon />
              </IconButton>
            </Tooltip>
          </Box>
        )}
      </CardActions>
    </Card>
  );
};

ItemCard.propTypes = {
  item: itemPropType.isRequired,
  isOwner: PropTypes.bool.isRequired,
  onPurchase: PropTypes.func.isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};

export default ItemCard;
