import PropTypes from 'prop-types';
import { Navigate, useLocation } from 'react-router';

import { useGetMeQuery } from '../features/user/userApiSlice';
import ErrorPage from '../pages/ErrorPage';

import Loader from './Loader';

/**
 * Shows the app only to visitors with a valid passphrase session; everyone else goes to the
 * passphrase screen. Routing UX only — the API checks the session on every request.
 */
const RequireAccess = ({ children }) => {
  const location = useLocation();
  const { data, error, isLoading, isFetching } = useGetMeQuery();

  // While re-checking after a previous failure, wait rather than act on the stale error.
  if (isLoading || (isFetching && error)) return <Loader fullPage />;
  if (error?.status === 401) {
    return <Navigate to="/welcome" replace state={{ from: location.pathname }} />;
  }
  if (error || !data) return <ErrorPage status={500} />;

  return children;
};

RequireAccess.propTypes = {
  children: PropTypes.node.isRequired,
};

export default RequireAccess;
