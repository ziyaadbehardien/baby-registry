import { Outlet, createBrowserRouter } from 'react-router';

import BaseLayout from 'layout/BaseLayout';
import RequireAccess from 'components/RequireAccess';

import ErrorPage from '../pages/ErrorPage';
import LandingPage from '../pages/LandingPage';
import PurchasedPage from '../pages/PurchasedPage';
import RegistryPage from '../pages/RegistryPage';
import WelcomePage from '../pages/WelcomePage';

const router = createBrowserRouter([
  {
    element: <Outlet />,
    errorElement: <ErrorPage status={500} />,
    children: [
      { path: 'welcome', element: <WelcomePage /> },
      {
        path: '/',
        element: (
          <RequireAccess>
            <BaseLayout />
          </RequireAccess>
        ),
        children: [
          { index: true, element: <LandingPage /> },
          { path: 'registry', element: <RegistryPage /> },
          { path: 'purchased', element: <PurchasedPage /> },
        ],
      },
      { path: '*', element: <ErrorPage status={404} /> },
    ],
  },
]);

export default router;
