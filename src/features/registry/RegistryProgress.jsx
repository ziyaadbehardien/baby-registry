import PropTypes from 'prop-types';

import { Stack } from '@mui/material';
import CardGiftcardIcon from '@mui/icons-material/CardGiftcard';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';

import TMetricBlock from 'components/TMetricBlock';

import { getProgress } from '../../utils/registry';

const percent = (part, whole) => (whole === 0 ? 0 : Math.round((part / whole) * 100));

const RegistryProgress = ({ items }) => {
  const { itemsTotal, itemsComplete, unitsWanted, unitsPurchased } = getProgress(items);

  return (
    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
      <TMetricBlock
        title="Items fully bought"
        value={`${itemsComplete} of ${itemsTotal}`}
        icon={<CheckCircleOutlineIcon />}
        color="primary"
        progress={percent(itemsComplete, itemsTotal)}
      />
      <TMetricBlock
        title="Gifts bought"
        value={`${unitsPurchased} of ${unitsWanted}`}
        icon={<CardGiftcardIcon />}
        color="secondary"
        progress={percent(unitsPurchased, unitsWanted)}
      />
    </Stack>
  );
};

RegistryProgress.propTypes = {
  items: PropTypes.arrayOf(PropTypes.object).isRequired,
};

export default RegistryProgress;
