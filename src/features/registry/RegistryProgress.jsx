import PropTypes from 'prop-types';

import CardGiftcardIcon from '@mui/icons-material/CardGiftcard';

import TMetricBlock from 'components/TMetricBlock';

import { getProgress } from '../../utils/registry';

const percent = (part, whole) => (whole === 0 ? 0 : Math.round((part / whole) * 100));
const plural = (count, word) => `${word}${count === 1 ? '' : 's'}`;

/**
 * One progress block: the main figure counts every gift (so 4 of 6 swaddles count as 4), and the
 * detail line counts registry entries where everything asked for has been bought.
 */
const RegistryProgress = ({ items }) => {
  const { itemsTotal, itemsComplete, unitsWanted, unitsPurchased } = getProgress(items);

  return (
    <TMetricBlock
      title="Registry progress"
      value={`${unitsPurchased} of ${unitsWanted} ${plural(unitsWanted, 'gift')} bought`}
      icon={<CardGiftcardIcon />}
      color="primary"
      progress={percent(unitsPurchased, unitsWanted)}
      detail={`${itemsComplete} of ${itemsTotal} ${plural(itemsTotal, 'item')} complete`}
    />
  );
};

RegistryProgress.propTypes = {
  items: PropTypes.arrayOf(PropTypes.object).isRequired,
};

export default RegistryProgress;
