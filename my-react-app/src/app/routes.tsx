import { createBrowserRouter } from 'react-router';
import Landing from './pages/Landing';
import Activities from './pages/Activities';
import ActivityDetail from './pages/ActivityDetail';
import MyGroups from './pages/MyGroups';
import Admin from './pages/Admin';
import AdminGroups from './pages/AdminGroups';
import AdminRequests from './pages/AdminRequests';
import AdminActivities from './pages/AdminActivities';
import AdminUsers from './pages/AdminUsers';
import AdminComplaints from './pages/AdminComplaints';
import AdminBilling from './pages/AdminBilling';
import AdminUserProfile from './pages/AdminUserProfile';
import GroupBooking from './pages/GroupBooking';
import CancelEvent from './pages/CancelEvent';
import Payment from './pages/Payment';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';
import { AdminRoute } from './components/AdminRoute';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Landing />,
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
    path: '/profile',
    element: <Profile />,
  },
  {
    element: <AdminRoute />,
    children: [
      {
        path: '/admin',
        element: <Admin />,
      },
      {
        path: '/admin/groups',
        element: <AdminGroups />,
      },
      {
        path: '/admin/requests',
        element: <AdminRequests />,
      },
      {
        path: '/admin/activities',
        element: <AdminActivities />,
      },
      {
        path: '/admin/users',
        element: <AdminUsers />,
      },
      {
        path: '/admin/complaints',
        element: <AdminComplaints />,
      },
      {
        path: '/admin/billing',
        element: <AdminBilling />,
      },
      {
        path: '/admin/users/:userId',
        element: <AdminUserProfile />,
      },
    ],
  },
  {
    path: '/cancel-event/:groupId',
    element: <CancelEvent />,
  },
  {
    path: '/payment/:groupId',
    element: <Payment />,
  },
  {
    path: '/group-booking/:activityId',
    element: <GroupBooking />,
  },
  {
    path: '*',
    element: <NotFound />,
  },
]);