import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { Sidebar } from '../components/Sidebar';
import { mockUsers } from '../data/mockData';
import { Input } from '../components/ui/input';
import { ArrowLeft, Search, ShieldCheck, ShieldOff, Users, ExternalLink } from 'lucide-react';
import type { User } from '../types';

type UserRow = User & { groupCount: number; isCurrentUser: boolean };

const subStyle: Record<string, string> = {
  active: 'bg-green-50 text-green-600',
  trial: 'bg-blue-50 text-blue-500',
  inactive: 'bg-gray-100 text-gray-400',
};

export default function AdminUsers() {
  const { user: currentUser } = useAuth();
  const { groups } = useApp();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [subFilter, setSubFilter] = useState<string>('all');
  const [localStatuses, setLocalStatuses] = useState<Record<string, User['subscriptionStatus']>>({});

  const allUsers: UserRow[] = [
    ...(currentUser ? [{ ...currentUser, isCurrentUser: true }] : []),
    ...mockUsers.map(u => ({ ...u, isCurrentUser: false })),
  ].map(u => ({
    ...u,
    groupCount: groups.filter(g => g.members.some(m => m.userId === u.id)).length,
    isCurrentUser: (u as UserRow).isCurrentUser,
  }));

  const getStatus = (u: UserRow): User['subscriptionStatus'] =>
    localStatuses[u.id] ?? u.subscriptionStatus;

  const toggleStatus = (u: UserRow) => {
    const current = getStatus(u);
    const next: User['subscriptionStatus'] = current === 'active' ? 'inactive' : 'active';
    setLocalStatuses(prev => ({ ...prev, [u.id]: next }));
  };

  const filtered = allUsers.filter(u => {
    const s = getStatus(u);
    const matchesSub = subFilter === 'all' || s === subFilter;
    const matchesSearch = !search ||
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    return matchesSub && matchesSearch;
  });

  const counts = {
    all: allUsers.length,
    active: allUsers.filter(u => getStatus(u) === 'active').length,
    trial: allUsers.filter(u => getStatus(u) === 'trial').length,
    inactive: allUsers.filter(u => getStatus(u) === 'inactive').length,
  };

  const avatarColors = ['from-orange-400 to-pink-500', 'from-purple-400 to-indigo-500', 'from-teal-400 to-cyan-500', 'from-green-400 to-emerald-500'];

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />

      <main className="flex-1 overflow-auto min-w-0">
        <div className="bg-white border-b border-gray-100 px-8 py-5 flex items-center gap-4 sticky top-0 z-40">
          <button onClick={() => navigate('/admin')} className="size-9 rounded-xl border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors">
            <ArrowLeft className="size-4" />
          </button>
          <div>
            <h1 className="text-xl font-extrabold text-gray-900">User Management</h1>
            <p className="text-sm text-gray-400 mt-0.5">Manage user accounts and subscription statuses.</p>
          </div>
          <span className="ml-auto text-xs text-gray-400 font-semibold">{allUsers.length} users</span>
        </div>

        <div className="px-8 py-6 space-y-5">
          {/* Search + filter */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
              <Input
                placeholder="Search by name or email..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-10 bg-white border-gray-200 rounded-xl"
              />
            </div>
          </div>

          {/* Filter tabs */}
          <div className="flex gap-2 flex-wrap">
            {(['all', 'active', 'trial', 'inactive'] as const).map(s => (
              <button
                key={s}
                onClick={() => setSubFilter(s)}
                className={`px-4 py-2 rounded-full text-sm font-semibold capitalize transition-colors ${
                  subFilter === s
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-white text-gray-500 border border-gray-200 hover:bg-gray-50'
                }`}
              >
                {s} <span className={`ml-1 text-xs ${subFilter === s ? 'text-white/70' : 'text-gray-400'}`}>({counts[s]})</span>
              </button>
            ))}
          </div>

          {/* Table */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/60">
                  <th className="px-6 py-3.5 text-left text-xs font-extrabold text-gray-400 uppercase tracking-wider">User</th>
                  <th className="px-6 py-3.5 text-left text-xs font-extrabold text-gray-400 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3.5 text-left text-xs font-extrabold text-gray-400 uppercase tracking-wider">Subscription</th>
                  <th className="px-6 py-3.5 text-left text-xs font-extrabold text-gray-400 uppercase tracking-wider">Groups</th>
                  <th className="px-6 py-3.5 text-left text-xs font-extrabold text-gray-400 uppercase tracking-wider">Actions</th>
                  <th className="px-6 py-3.5" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((u, idx) => {
                  const status = getStatus(u);
                  return (
                    <tr key={u.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`size-9 rounded-full bg-gradient-to-br ${avatarColors[idx % avatarColors.length]} flex items-center justify-center text-white font-bold text-sm shrink-0`}>
                            {u.name.charAt(0)}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-800">
                              {u.name}
                              {u.isCurrentUser && (
                                <span className="ml-1.5 text-[10px] font-bold bg-pink-100 text-pink-500 px-1.5 py-0.5 rounded-full">You</span>
                              )}
                            </p>
                            <p className="text-xs text-gray-400">{u.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">{u.email}</td>
                      <td className="px-6 py-4">
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${subStyle[status]}`}>
                          {status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="flex items-center gap-1.5 text-sm text-gray-500">
                          <Users className="size-3.5 text-gray-300" />
                          {u.groupCount}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => toggleStatus(u)}
                          className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg transition-colors ${
                            status === 'active'
                              ? 'text-red-500 bg-red-50 hover:bg-red-100'
                              : 'text-green-600 bg-green-50 hover:bg-green-100'
                          }`}
                        >
                          {status === 'active' ? (
                            <><ShieldOff className="size-3.5" /> Deactivate</>
                          ) : (
                            <><ShieldCheck className="size-3.5" /> Activate</>
                          )}
                        </button>
                      </td>
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
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-16 text-center text-sm text-gray-400">No users match this filter.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
