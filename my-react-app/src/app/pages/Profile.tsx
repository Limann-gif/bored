import { useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { Sidebar } from '../components/Sidebar';
import {
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Calendar,
  Star,
  Users,
  Activity,
  ShieldCheck,
  ShieldOff,
  Zap,
} from 'lucide-react';

// Supplementary data not in the User type (mirrors AdminUserProfile)
const EXTRA: Record<string, { phone: string; occupation: string; gradientFrom: string; gradientTo: string; bio: string; joined: string }> = {
  'user-1': { phone: '+1 (415) 555-0101', occupation: 'Software Engineer',  gradientFrom: '#f97316', gradientTo: '#ec4899', bio: 'Loves hiking, coffee, and solving hard problems. Always up for a new adventure around the city.', joined: '2025-09-12' },
  'user-2': { phone: '+1 (415) 555-0102', occupation: 'UX Designer',         gradientFrom: '#a855f7', gradientTo: '#6366f1', bio: 'Creative soul who enjoys board games, art museums, and late-night street food crawls.', joined: '2025-10-03' },
  'user-3': { phone: '+1 (415) 555-0103', occupation: 'Marketing Manager',   gradientFrom: '#14b8a6', gradientTo: '#06b6d4', bio: 'Foodie and amateur salsa dancer. Always looking for the next great restaurant or rooftop event.', joined: '2025-11-18' },
  'user-4': { phone: '+1 (415) 555-0104', occupation: 'Graphic Designer',    gradientFrom: '#22c55e', gradientTo: '#10b981', bio: 'Creative professional passionate about pottery, typography, and weekend hikes.', joined: '2025-10-29' },
  'user-5': { phone: '+1 (415) 555-0105', occupation: 'Data Scientist',      gradientFrom: '#3b82f6', gradientTo: '#8b5cf6', bio: 'Escape room enthusiast and yoga practitioner. Fueled by green tea and good datasets.', joined: '2025-12-05' },
  'user-6': { phone: '+1 (415) 555-0106', occupation: 'Photographer',        gradientFrom: '#f59e0b', gradientTo: '#ef4444', bio: 'Captures the world through a lens. Loves brewery tours, karaoke nights, and golden hour shoots.', joined: '2026-01-14' },
  'user-7': { phone: '+1 (415) 555-0107', occupation: 'Product Manager',     gradientFrom: '#ec4899', gradientTo: '#f97316', bio: 'Strategy-first thinker who recharges with sunrise yoga and hackathon weekends.', joined: '2026-01-28' },
  'user-8': { phone: '+1 (415) 555-0108', occupation: 'Architect',           gradientFrom: '#06b6d4', gradientTo: '#22c55e', bio: 'Designs spaces by day, explores them by night. Passionate about street food and urban hiking.', joined: '2026-02-09' },
};

const DEFAULT_EXTRA = {
  phone: 'Not provided',
  occupation: 'Not specified',
  gradientFrom: '#a855f7',
  gradientTo: '#ec4899',
  bio: 'No bio available.',
  joined: '2026-01-01',
};

const subStyle: Record<string, { badge: string; icon: React.ElementType; label: string }> = {
  active:   { badge: 'bg-green-50 text-green-600 border-green-100', icon: ShieldCheck, label: 'Active' },
  trial:    { badge: 'bg-blue-50 text-blue-500 border-blue-100',    icon: ShieldCheck, label: 'Trial' },
  inactive: { badge: 'bg-gray-100 text-gray-400 border-gray-200',   icon: ShieldOff,   label: 'Inactive' },
};

export default function Profile() {
  const { user } = useAuth();
  const { getUserGroups, activities } = useApp();
  const navigate = useNavigate();

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Please log in to view your profile.</p>
      </div>
    );
  }

  const extra = EXTRA[user.id] ?? DEFAULT_EXTRA;
  const myGroups = getUserGroups();
  const completedGroups = myGroups.filter(g => g.status === 'completed');
  const { badge, icon: StatusIcon, label: statusLabel } = subStyle[user.subscriptionStatus] ?? subStyle.inactive;
  const isPro = user.subscriptionStatus === 'active';

  const initials = user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  const { gradientFrom: gradFrom, gradientTo: gradTo } = extra;

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />

      <main className="flex-1 overflow-auto min-w-0">
        {/* Header */}
        <div className="bg-white border-b border-gray-100 px-8 py-5 sticky top-0 z-40">
          <h1 className="text-xl font-extrabold text-gray-900">My Profile</h1>
          <p className="text-sm text-gray-400 mt-0.5">{user.name}</p>
        </div>

        <div className="px-8 py-8 max-w-4xl space-y-6">
          {/* Profile hero card */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
            {/* Banner */}
            <div
              className="h-32"
              style={{ background: `linear-gradient(135deg, ${gradFrom}, ${gradTo})` }}
            />

            <div className="px-8 pb-8">
              {/* Avatar overlapping banner */}
              <div className="flex items-end justify-between -mt-12 mb-5">
                <div
                  className="size-24 rounded-2xl border-4 border-white shadow-md flex items-center justify-center text-white text-3xl font-extrabold shrink-0"
                  style={{ background: `linear-gradient(135deg, ${gradFrom}, ${gradTo})` }}
                >
                  {initials}
                </div>
                <div className="flex items-center gap-2 mb-1">
                  {isPro ? (
                    <span className="flex items-center gap-1.5 text-xs font-bold bg-gradient-to-r from-yellow-400 to-orange-400 text-white px-3 py-1.5 rounded-full">
                      <Star className="size-3.5 fill-white" /> Gold Member
                    </span>
                  ) : (
                    <button
                      onClick={() => navigate('/')}
                      className="flex items-center gap-1.5 text-xs font-bold bg-gradient-to-r from-pink-500 to-purple-600 text-white px-3 py-1.5 rounded-full hover:opacity-90 transition-opacity"
                    >
                      <Zap className="size-3.5 fill-white" /> Go Pro
                    </button>
                  )}
                  <span className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full border ${badge}`}>
                    <StatusIcon className="size-3.5" />
                    {statusLabel}
                  </span>
                </div>
              </div>

              {/* Name & occupation */}
              <h2 className="text-2xl font-extrabold text-gray-900 leading-tight">{user.name}</h2>
              <p className="text-sm text-gray-500 mt-0.5 flex items-center gap-1.5">
                <Briefcase className="size-3.5 text-gray-400" />
                {extra.occupation}
              </p>

              {/* Bio */}
              <p className="text-sm text-gray-500 mt-4 leading-relaxed max-w-lg">{extra.bio}</p>
            </div>
          </div>

          {/* Details grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Contact info */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
              <h3 className="text-xs font-extrabold text-gray-400 uppercase tracking-widest">Contact Information</h3>

              <div className="flex items-start gap-3">
                <div className="size-9 rounded-xl bg-pink-50 flex items-center justify-center shrink-0">
                  <Mail className="size-4 text-pink-500" />
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Email</p>
                  <p className="text-sm font-semibold text-gray-800 mt-0.5">{user.email}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="size-9 rounded-xl bg-purple-50 flex items-center justify-center shrink-0">
                  <Phone className="size-4 text-purple-500" />
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Phone Number</p>
                  <p className="text-sm font-semibold text-gray-800 mt-0.5">{extra.phone}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="size-9 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                  <MapPin className="size-4 text-blue-500" />
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Location</p>
                  <p className="text-sm font-semibold text-gray-800 mt-0.5">
                    {user.location?.address ?? 'Not provided'}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="size-9 rounded-xl bg-amber-50 flex items-center justify-center shrink-0">
                  <Briefcase className="size-4 text-amber-500" />
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Occupation</p>
                  <p className="text-sm font-semibold text-gray-800 mt-0.5">{extra.occupation}</p>
                </div>
              </div>
            </div>

            {/* Account info */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
              <h3 className="text-xs font-extrabold text-gray-400 uppercase tracking-widest">Account Details</h3>

              <div className="flex items-start gap-3">
                <div className="size-9 rounded-xl bg-green-50 flex items-center justify-center shrink-0">
                  <Calendar className="size-4 text-green-500" />
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Member Since</p>
                  <p className="text-sm font-semibold text-gray-800 mt-0.5">
                    {new Date(extra.joined).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="size-9 rounded-xl bg-teal-50 flex items-center justify-center shrink-0">
                  <ShieldCheck className="size-4 text-teal-500" />
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Subscription</p>
                  <p className="text-sm font-semibold text-gray-800 mt-0.5 capitalize">{user.subscriptionStatus}</p>
                  {user.subscriptionExpiry && (
                    <p className="text-xs text-gray-400 mt-0.5">
                      Expires {new Date(user.subscriptionExpiry).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="size-9 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0">
                  <Users className="size-4 text-indigo-500" />
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">User ID</p>
                  <p className="text-xs font-mono text-gray-500 mt-0.5 break-all">{user.id}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Groups Joined', value: myGroups.length,       icon: Users,     bg: 'bg-purple-50', color: 'text-purple-500' },
              { label: 'Completed',     value: completedGroups.length, icon: Star,      bg: 'bg-amber-50',  color: 'text-amber-500' },
              { label: 'Activities',    value: activities.length,      icon: Activity,  bg: 'bg-pink-50',   color: 'text-pink-500' },
            ].map(({ label, value, icon: Icon, bg, color }) => (
              <div key={label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 text-center">
                <div className={`size-10 rounded-xl ${bg} flex items-center justify-center mx-auto mb-3`}>
                  <Icon className={`size-5 ${color}`} />
                </div>
                <p className="text-2xl font-extrabold text-gray-900">{value}</p>
                <p className="text-xs text-gray-400 font-medium mt-1">{label}</p>
              </div>
            ))}
          </div>

          {/* Group history */}
          {myGroups.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100">
                <h3 className="text-xs font-extrabold text-gray-400 uppercase tracking-widest">Group History</h3>
              </div>
              <div className="divide-y divide-gray-50">
                {myGroups.map(group => {
                  const activity = activities.find(a => a.id === group.activityId);
                  const statusColors: Record<string, string> = {
                    confirmed: 'bg-green-50 text-green-600',
                    forming:   'bg-amber-50 text-amber-600',
                    completed: 'bg-blue-50 text-blue-600',
                    cancelled: 'bg-gray-100 text-gray-400',
                  };
                  return (
                    <div key={group.id} className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50/50 transition-colors">
                      {activity?.image && (
                        <img
                          src={activity.image}
                          alt={activity.name}
                          className="size-10 rounded-xl object-cover shrink-0"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-800 truncate">{activity?.name ?? 'Unknown Activity'}</p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {new Date(group.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          {' · '}{group.members.length} members
                        </p>
                      </div>
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize shrink-0 ${statusColors[group.status] ?? 'bg-gray-100 text-gray-400'}`}>
                        {group.status}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
