import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { Sidebar } from '../components/Sidebar';
import { apiService } from '../../services/api';
import type { AdminUserRecord } from '../../services/api';
import { Input } from '../components/ui/input';
import { ArrowLeft, Search, Users, ExternalLink, ShieldCheck } from 'lucide-react';

const avatarColors = [
  'from-orange-400 to-pink-500',
  'from-purple-400 to-indigo-500',
  'from-teal-400 to-cyan-500',
  'from-green-400 to-emerald-500',
];

export default function AdminUsers() {
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers]   = useState<AdminUserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    apiService.getUsers()
      .then(setUsers)
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const filtered = users.filter(u =>
    !search ||
    u.username.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />

      <main className="flex-1 overflow-auto min-w-0">
        {/* Header */}
        <div className="bg-white border-b border-gray-100 px-8 py-5 flex items-center gap-4 sticky top-0 z-40">
          <button
            onClick={() => navigate('/admin')}
            className="size-9 rounded-xl border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft className="size-4" />
          </button>
          <div>
            <h1 className="text-xl font-extrabold text-gray-900">User Management</h1>
            <p className="text-sm text-gray-400 mt-0.5">View all registered users.</p>
          </div>
          <span className="ml-auto text-xs text-gray-400 font-semibold">{users.length} users</span>
        </div>

        <div className="px-8 py-6 space-y-5">
          {/* Search */}
          <div className="relative max-w-sm">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
            <Input
              placeholder="Search by name or email…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-10 bg-white border-gray-200 rounded-xl"
            />
          </div>

          {/* Table */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {loading ? (
              <div className="py-20 text-center text-gray-400 text-sm">Loading users…</div>
            ) : error ? (
              <div className="py-20 text-center text-red-400 text-sm">{error}</div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/60">
                    <th className="px-6 py-3.5 text-left text-xs font-extrabold text-gray-400 uppercase tracking-wider">User</th>
                    <th className="px-6 py-3.5 text-left text-xs font-extrabold text-gray-400 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3.5 text-left text-xs font-extrabold text-gray-400 uppercase tracking-wider">Role</th>
                    <th className="px-6 py-3.5 text-left text-xs font-extrabold text-gray-400 uppercase tracking-wider">Groups</th>
                    <th className="px-6 py-3.5" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-16 text-center text-sm text-gray-400">
                        No users match this search.
                      </td>
                    </tr>
                  ) : filtered.map((u, idx) => {
                    const isCurrentUser = u.id === currentUser?.id;
                    const isAdmin = u.role.toUpperCase() === 'ADMIN';
                    return (
                      <tr key={u.id} className="hover:bg-gray-50/50 transition-colors">
                        {/* User */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className={`size-9 rounded-full bg-gradient-to-br ${avatarColors[idx % avatarColors.length]} flex items-center justify-center text-white font-bold text-sm shrink-0`}>
                              {u.username.charAt(0)}
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-gray-800">
                                {u.username}
                                {isCurrentUser && (
                                  <span className="ml-1.5 text-[10px] font-bold bg-pink-100 text-pink-500 px-1.5 py-0.5 rounded-full">You</span>
                                )}
                              </p>
                              <p className="text-xs text-gray-400 font-mono">{u.id.slice(0, 12)}…</p>
                            </div>
                          </div>
                        </td>

                        {/* Email */}
                        <td className="px-6 py-4 text-sm text-gray-500">{u.email}</td>

                        {/* Role */}
                        <td className="px-6 py-4">
                          {isAdmin ? (
                            <span className="flex items-center gap-1 text-xs font-bold bg-purple-100 text-purple-600 px-2.5 py-1 rounded-full w-fit">
                              <ShieldCheck className="size-3" /> Admin
                            </span>
                          ) : (
                            <span className="text-xs font-semibold bg-gray-100 text-gray-500 px-2.5 py-1 rounded-full capitalize">
                              {u.role}
                            </span>
                          )}
                        </td>

                        {/* Groups (bookingCount) */}
                        <td className="px-6 py-4">
                          <span className="flex items-center gap-1.5 text-sm text-gray-500">
                            <Users className="size-3.5 text-gray-300" />
                            {u.bookingCount}
                          </span>
                        </td>

                        {/* View profile */}
                        <td className="px-6 py-4">
                          <button
                            onClick={() => navigate(`/admin/users/${u.id}`)}
                            className="flex items-center gap-1.5 text-xs font-bold text-pink-500 hover:text-pink-600 bg-pink-50 hover:bg-pink-100 px-3 py-1.5 rounded-lg transition-colors"
                          >
                            <ExternalLink className="size-3.5" /> View Profile
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
