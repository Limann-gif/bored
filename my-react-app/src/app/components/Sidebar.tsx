import { Link, useLocation, useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { Sparkles, Home, Users, Compass, User, MessageSquare, Settings, ShieldCheck } from 'lucide-react';

const navItems = [
  { icon: Home, label: 'Home', path: '/' },
  { icon: Users, label: 'My Matches', path: '/my-groups' },
  { icon: Compass, label: 'Explore Activities', path: '/activities' },
  { icon: User, label: 'Profile', path: '/profile' },
  { icon: MessageSquare, label: 'Messages', path: '/messages' },
  { icon: ShieldCheck, label: 'Admin', path: '/admin' },
];

export function Sidebar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  if (!user) return null;

  const firstName = user.name.split(' ')[0];

  return (
    <aside className="w-64 shrink-0 min-h-screen bg-white border-r border-gray-100 flex flex-col sticky top-0 h-screen overflow-y-auto">
      {/* Logo */}
      <div className="px-6 pt-7 pb-8">
        <Link to="/activities" className="flex items-center gap-2">
          <Sparkles className="size-8 text-purple-600" />
          <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Bored!
          </span>
        </Link>
      </div>

      {/* Nav */}
      <nav className="px-3 flex-1 space-y-0.5">
        {navItems.map(({ icon: Icon, label, path }) => {
          const isActive = location.pathname === path;
          return (
            <Link
              key={path}
              to={path}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-pink-50 text-pink-600'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'
              }`}
            >
              <Icon
                className={`size-5 shrink-0 ${isActive ? 'text-pink-500' : 'text-gray-400'}`}
              />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* GO PRO card */}
      <div className="mx-4 mb-4 p-4 bg-gradient-to-br from-purple-600 to-pink-500 rounded-2xl text-white">
        <p className="text-[11px] font-extrabold uppercase tracking-wider mb-1">Go Pro</p>
        <p className="text-xs opacity-85 leading-relaxed mb-3">
          Unlock exclusive local hangouts and priority matching.
        </p>
        <button className="w-full bg-white text-pink-600 text-xs font-bold py-2 rounded-xl hover:bg-pink-50 transition-colors">
          Upgrade Now
        </button>
      </div>

      {/* User profile */}
      <div className="px-4 py-4 border-t border-gray-100 flex items-center gap-3">
        <div className="size-9 rounded-full bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center text-white font-bold text-sm shrink-0">
          {firstName.charAt(0)}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900 truncate">{user.name}</p>
          <p className="text-xs text-gray-400">
            {user.subscriptionStatus === 'active' ? 'Gold Member' : 'Free Tier'}
          </p>
        </div>
        <button
          onClick={() => { logout(); navigate('/'); }}
          className="text-gray-400 hover:text-gray-600 transition-colors"
          title="Logout"
        >
          <Settings className="size-4" />
        </button>
      </div>
    </aside>
  );
}
