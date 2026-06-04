import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { Sidebar } from '../components/Sidebar';
import { apiService } from '../../services/api';
import type { AdminUserDetail } from '../../services/api';
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Calendar,
  ShieldCheck,
  Users,
  Receipt,
  MessageSquareWarning,
  UserCircle2,
} from 'lucide-react';
import { format } from 'date-fns';

const AVATAR_GRADIENTS = [
  ['#f97316', '#ec4899'],
  ['#a855f7', '#6366f1'],
  ['#14b8a6', '#06b6d4'],
  ['#22c55e', '#10b981'],
  ['#3b82f6', '#8b5cf6'],
  ['#f59e0b', '#ef4444'],
  ['#ec4899', '#f97316'],
  ['#06b6d4', '#22c55e'],
];

export default function AdminUserProfile() {
  const { userId } = useParams<{ userId: string }>();
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();

  const [user, setUser]     = useState<AdminUserDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState('');

  useEffect(() => {
    if (!userId) return;
    apiService.getUserById(userId)
      .then(setUser)
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, [userId]);

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <main className="flex-1 flex items-center justify-center">
          <p className="text-gray-400 text-sm">Loading profile…</p>
        </main>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <UserCircle2 className="size-12 text-gray-200 mx-auto mb-3" />
            <p className="text-gray-500 font-semibold">{error || 'User not found.'}</p>
            <button onClick={() => navigate('/admin/users')} className="mt-4 text-sm text-pink-500 hover:underline">
              Back to Users
            </button>
          </div>
        </main>
      </div>
    );
  }

  const isCurrentUser = user.id === currentUser?.id;
  const isAdmin = user.role.toUpperCase() === 'ADMIN';
  const initials = user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  const [gradFrom, gradTo] = AVATAR_GRADIENTS[
    parseInt(user.id.replace(/-/g, '').slice(0, 8), 16) % AVATAR_GRADIENTS.length
  ];

  const stats = [
    { label: 'Bookings',     value: user.bookingOrders.length,  icon: Users,                  bg: 'bg-purple-50', color: 'text-purple-500' },
    { label: 'Transactions', value: user.transactions.length,   icon: Receipt,                bg: 'bg-amber-50',  color: 'text-amber-500'  },
    { label: 'Complaints',   value: user.complaints.length,     icon: MessageSquareWarning,   bg: 'bg-red-50',    color: 'text-red-400'    },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />

      <main className="flex-1 overflow-auto min-w-0">
        {/* Header */}
        <div className="bg-white border-b border-gray-100 px-8 py-5 flex items-center gap-4 sticky top-0 z-40">
          <button
            onClick={() => navigate('/admin/users')}
            className="size-9 rounded-xl border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft className="size-4" />
          </button>
          <div>
            <h1 className="text-xl font-extrabold text-gray-900">User Profile</h1>
            <p className="text-sm text-gray-400 mt-0.5">Viewing details for {user.name}.</p>
          </div>
        </div>

        <div className="px-8 py-8 max-w-4xl space-y-6">
          {/* Profile hero card */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
            {/* Banner */}
            <div className="h-32" style={{ background: `linear-gradient(135deg, ${gradFrom}, ${gradTo})` }} />

            <div className="px-8 pb-8">
              <div className="flex items-end justify-between -mt-12 mb-5">
                <div
                  className="size-24 rounded-2xl border-4 border-white shadow-md flex items-center justify-center text-white text-3xl font-extrabold shrink-0"
                  style={{ background: `linear-gradient(135deg, ${gradFrom}, ${gradTo})` }}
                >
                  {initials}
                </div>
                <div className="flex items-center gap-2 mb-1">
                  {isCurrentUser && (
                    <span className="text-xs font-bold bg-pink-100 text-pink-500 px-3 py-1.5 rounded-full">You</span>
                  )}
                  <span className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full border ${
                    isAdmin
                      ? 'bg-purple-50 text-purple-600 border-purple-100'
                      : 'bg-gray-100 text-gray-500 border-gray-200'
                  }`}>
                    <ShieldCheck className="size-3.5" />
                    {isAdmin ? 'Admin' : 'User'}
                  </span>
                </div>
              </div>

              <h2 className="text-2xl font-extrabold text-gray-900 leading-tight">{user.name}</h2>
              {user.occupation && (
                <p className="text-sm text-gray-500 mt-0.5 flex items-center gap-1.5">
                  <Briefcase className="size-3.5 text-gray-400" />
                  {user.occupation}
                </p>
              )}
              {user.bio && (
                <p className="text-sm text-gray-500 mt-4 leading-relaxed max-w-lg">{user.bio}</p>
              )}
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
                  <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Phone</p>
                  <p className="text-sm font-semibold text-gray-800 mt-0.5">{user.phone ?? 'Not provided'}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="size-9 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                  <MapPin className="size-4 text-blue-500" />
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Location</p>
                  <p className="text-sm font-semibold text-gray-800 mt-0.5">{user.locationAddress ?? 'Not provided'}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="size-9 rounded-xl bg-amber-50 flex items-center justify-center shrink-0">
                  <Briefcase className="size-4 text-amber-500" />
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Occupation</p>
                  <p className="text-sm font-semibold text-gray-800 mt-0.5">{user.occupation ?? 'Not specified'}</p>
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
                    {format(new Date(user.joinedAt), 'MMMM d, yyyy')}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="size-9 rounded-xl bg-purple-50 flex items-center justify-center shrink-0">
                  <ShieldCheck className="size-4 text-purple-500" />
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Role</p>
                  <p className="text-sm font-semibold text-gray-800 mt-0.5 capitalize">{user.role}</p>
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
            {stats.map(({ label, value, icon: Icon, bg, color }) => (
              <div key={label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 text-center">
                <div className={`size-10 rounded-xl ${bg} flex items-center justify-center mx-auto mb-3`}>
                  <Icon className={`size-5 ${color}`} />
                </div>
                <p className="text-2xl font-extrabold text-gray-900">{value}</p>
                <p className="text-xs text-gray-400 font-medium mt-1">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
