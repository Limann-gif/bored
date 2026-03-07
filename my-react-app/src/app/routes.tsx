import { createBrowserRouter } from 'react-router';
import Landing from './pages/Landing';
import Subscription from './pages/Subscription';
import Activities from './pages/Activities';
import ActivityDetail from './pages/ActivityDetail';
import MyGroups from './pages/MyGroups';
import NotFound from './pages/NotFound';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Landing />,
  },
  {
    path: '/subscription',
    element: <Subscription />,
  },
  {
    path: '/activities',
    element: <Activities />,
  },
  {
    path: '/activity/:id',
    element: <ActivityDetail />,
  },
  {
    path: '/my-groups',
    element: <MyGroups />,
  },
  {
    path: '*',
    element: <NotFound />,
  },
]);