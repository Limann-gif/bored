import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useApp } from '../context/AppContext';
import { Sidebar } from '../components/Sidebar';
import { ArrowLeft, Search, CheckCircle, XCircle, Users, Calendar } from 'lucide-react';
import { Input } from '../components/ui/input';
import type { Group } from '../types';

const STATUS_FILTERS = ['all', 'forming', 'confirmed', 'completed', 'cancelled'] as const;

const statusStyle: Record<string, string> = {
  forming: 'bg-amber-50 text-amber-600',
  confirmed: 'bg-green-50 text-green-600',
  completed: 'bg-blue-50 text-blue-600',
  cancelled: 'bg-red-50 text-red-500',
};

export default function AdminGroups() {
  const { groups, activities, updateGroupStatus } = useApp();
  const navigate = useNavigate();
  const [filter, setFilter] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [confirmAction, setConfirmAction] = useState<{ groupId: string; action: 'confirmed' | 'cancelled' } | null>(null);

  const getActivity = (activityId: string) => activities.find(a => a.id === activityId);

  const filtered = groups.filter(g => {
    const matchesFilter = filter === 'all' || g.status === filter;
    const activity = getActivity(g.activityId);
    const matchesSearch = !search || activity?.name.toLowerCase().includes(search.toLowerCase()) || g.id.includes(search);
    return matchesFilter && matchesSearch;
  });

  const counts: Record<string, number> = {
    all: groups.length,
    forming: groups.filter(g => g.status === 'forming').length,
    confirmed: groups.filter(g => g.status === 'confirmed').length,
    completed: groups.filter(g => g.status === 'completed').length,
    cancelled: groups.filter(g => g.status === 'cancelled').length,
  };

  const handleAction = (groupId: string, action: 'confirmed' | 'cancelled') => {
    setConfirmAction({ groupId, action });
  };

  const executeAction = () => {
    if (!confirmAction) return;
    updateGroupStatus(confirmAction.groupId, confirmAction.action);
    setConfirmAction(null);
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />

      {/* Confirm modal */}
      {confirmAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-80">
            <h3 className="font-extrabold text-gray-900 mb-2">
              {confirmAction.action === 'confirmed' ? 'Approve Group?' : 'Dissolve Group?'}
            </h3>
            <p className="text-sm text-gray-500 mb-5">
              {confirmAction.action === 'confirmed'
                ? 'This will mark the group as confirmed and notify members.'
                : 'This will cancel the group. Members will be notified.'}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmAction(null)}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={executeAction}
                className={`flex-1 py-2.5 rounded-xl text-sm font-bold text-white transition-colors ${
                  confirmAction.action === 'confirmed'
                    ? 'bg-green-500 hover:bg-green-600'
                    : 'bg-red-500 hover:bg-red-600'
                }`}
              >
                {confirmAction.action === 'confirmed' ? 'Approve' : 'Dissolve'}
              </button>
            </div>
          </div>
        </div>
      )}

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
            <h1 className="text-xl font-extrabold text-gray-900">Manage Groups</h1>
            <p className="text-sm text-gray-400 mt-0.5">View, approve, or dissolve all groups.</p>
          </div>
          <div className="ml-auto">
            <span className="text-xs font-semibold text-gray-400">{groups.length} total groups</span>
          </div>
        </div>

        <div className="px-8 py-6 space-y-5">
          {/* Search + Filter */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
              <Input
                placeholder="Search by activity name or group ID..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-10 bg-white border-gray-200 rounded-xl"
              />
            </div>
          </div>

          {/* Filter tabs */}
          <div className="flex gap-2 flex-wrap">
            {STATUS_FILTERS.map(s => (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={`px-4 py-2 rounded-full text-sm font-semibold capitalize transition-colors ${
                  filter === s
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'bg-white text-gray-500 border border-gray-200 hover:bg-gray-50'
                }`}
              >
                {s} <span className={`ml-1 text-xs ${filter === s ? 'text-white/70' : 'text-gray-400'}`}>({counts[s]})</span>
              </button>
            ))}
          </div>

          {/* Table */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {filtered.length === 0 ? (
              <div className="py-20 text-center text-gray-400 text-sm">
                No groups match this filter.
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/60">
                    <th className="px-6 py-3.5 text-left text-xs font-extrabold text-gray-400 uppercase tracking-wider">Group</th>
                    <th className="px-6 py-3.5 text-left text-xs font-extrabold text-gray-400 uppercase tracking-wider">Activity</th>
                    <th className="px-6 py-3.5 text-left text-xs font-extrabold text-gray-400 uppercase tracking-wider">Members</th>
                    <th className="px-6 py-3.5 text-left text-xs font-extrabold text-gray-400 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3.5 text-left text-xs font-extrabold text-gray-400 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3.5 text-left text-xs font-extrabold text-gray-400 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtered.map(group => {
                    const activity = getActivity(group.activityId);
                    return (
                      <tr key={group.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <span className="text-xs font-mono text-gray-400">{group.id.slice(0, 12)}…</span>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <p className="text-sm font-semibold text-gray-800">{activity?.name ?? 'Unknown'}</p>
                            <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                              <Calendar className="size-3" />
                              {activity ? new Date(activity.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—'}
                            </p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="flex -space-x-2">
                              {group.members.slice(0, 3).map((m, i) => (
                                <div
                                  key={i}
                                  className="size-7 rounded-full border-2 border-white bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center text-white text-[9px] font-bold"
                                >
                                  {m.name.charAt(0)}
                                </div>
                              ))}
                              {group.members.length > 3 && (
                                <div className="size-7 rounded-full border-2 border-white bg-gray-200 flex items-center justify-center text-[9px] font-bold text-gray-500">
                                  +{group.members.length - 3}
                                </div>
                              )}
                            </div>
                            <span className="text-xs text-gray-400 flex items-center gap-1">
                              <Users className="size-3" /> {group.members.length}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${statusStyle[group.status]}`}>
                            {group.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-400">
                          {new Date(group.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            {group.status === 'forming' && (
                              <button
                                onClick={() => handleAction(group.id, 'confirmed')}
                                className="flex items-center gap-1.5 text-xs font-semibold text-green-600 hover:text-green-700 bg-green-50 hover:bg-green-100 px-3 py-1.5 rounded-lg transition-colors"
                              >
                                <CheckCircle className="size-3.5" /> Approve
                              </button>
                            )}
                            {(group.status === 'forming' || group.status === 'confirmed') && (
                              <button
                                onClick={() => handleAction(group.id, 'cancelled')}
                                className="flex items-center gap-1.5 text-xs font-semibold text-red-500 hover:text-red-600 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition-colors"
                              >
                                <XCircle className="size-3.5" /> Dissolve
                              </button>
                            )}
                            {(group.status === 'completed' || group.status === 'cancelled') && (
                              <span className="text-xs text-gray-300">—</span>
                            )}
                          </div>
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
