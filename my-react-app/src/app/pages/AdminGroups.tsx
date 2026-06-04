import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useApp } from '../context/AppContext';
import { Sidebar } from '../components/Sidebar';
import {
  ArrowLeft, Search, Users, Calendar, MapPin, X, CheckCircle, XCircle,
} from 'lucide-react';
import { Input } from '../components/ui/input';
import { format } from 'date-fns';
import { apiService } from '../../services/api';
import type { AdminGroupRecord } from '../../services/api';

const STATUS_FILTERS = ['all', 'forming', 'confirmed', 'completed', 'cancelled'] as const;

const statusStyle: Record<string, string> = {
  forming:   'bg-amber-50 text-amber-600',
  confirmed: 'bg-green-50 text-green-600',
  completed: 'bg-blue-50 text-blue-600',
  cancelled: 'bg-red-50 text-red-500',
};

export default function AdminGroups() {
  const { activities } = useApp();
  const navigate = useNavigate();

  const [groups, setGroups]               = useState<AdminGroupRecord[]>([]);
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState('');
  const [filter, setFilter]               = useState<string>('all');
  const [search, setSearch]               = useState('');
  const [selectedGroup, setSelectedGroup] = useState<AdminGroupRecord | null>(null);

  useEffect(() => {
    apiService.getAdminGroups()
      .then(setGroups)
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const filtered = groups.filter(g => {
    const matchesFilter = filter === 'all' || g.activityStatus === filter;
    const matchesSearch = !search || g.nameOfActivity.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const counts: Record<string, number> = {
    all:       groups.length,
    forming:   groups.filter(g => g.activityStatus === 'forming').length,
    confirmed: groups.filter(g => g.activityStatus === 'confirmed').length,
    completed: groups.filter(g => g.activityStatus === 'completed').length,
    cancelled: groups.filter(g => g.activityStatus === 'cancelled').length,
  };

  // Try to enrich with activity data (date / location) matched by name
  const getActivityMeta = (name: string) =>
    activities.find(a => a.name.toLowerCase() === name.toLowerCase());

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
            <h1 className="text-xl font-extrabold text-gray-900">Manage Groups</h1>
            <p className="text-sm text-gray-400 mt-0.5">View all booked activity groups.</p>
          </div>
          <div className="ml-auto">
            <span className="text-xs font-semibold text-gray-400">{groups.length} total groups</span>
          </div>
        </div>

        <div className="px-8 py-6 space-y-5">
          {/* Search */}
          <div className="relative max-w-sm">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
            <Input
              placeholder="Search by activity name…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-10 bg-white border-gray-200 rounded-xl"
            />
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
            {loading ? (
              <div className="py-20 text-center text-gray-400 text-sm">Loading groups…</div>
            ) : error ? (
              <div className="py-20 text-center text-red-400 text-sm">{error}</div>
            ) : filtered.length === 0 ? (
              <div className="py-20 text-center text-gray-400 text-sm">No groups match this filter.</div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/60">
                    <th className="px-6 py-3.5 text-left text-xs font-extrabold text-gray-400 uppercase tracking-wider">Activity</th>
                    <th className="px-6 py-3.5 text-left text-xs font-extrabold text-gray-400 uppercase tracking-wider">Members</th>
                    <th className="px-6 py-3.5 text-left text-xs font-extrabold text-gray-400 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3.5 text-left text-xs font-extrabold text-gray-400 uppercase tracking-wider">Created</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtered.map((group, idx) => (
                    <tr
                      key={idx}
                      onClick={() => setSelectedGroup(group)}
                      className="hover:bg-gray-50/50 transition-colors cursor-pointer"
                    >
                      <td className="px-6 py-4">
                        <p className="text-sm font-semibold text-gray-800">{group.nameOfActivity}</p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="flex -space-x-2">
                            {group.members.slice(0, 3).map((m, i) => (
                              <div
                                key={i}
                                title={m.name}
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
                            <Users className="size-3" /> {group.numberOfParticipants}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${statusStyle[group.activityStatus] ?? 'bg-gray-100 text-gray-500'}`}>
                          {group.activityStatus}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-400">
                        {format(new Date(group.createdAt), 'MMM d, yyyy')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>

      {/* Group detail panel */}
      {selectedGroup && (() => {
        const meta = getActivityMeta(selectedGroup.nameOfActivity);
        return (
          <>
            <div
              className="fixed inset-0 z-40 bg-black/30"
              onClick={() => setSelectedGroup(null)}
            />
            <aside className="fixed right-0 top-0 z-50 h-full w-96 bg-white shadow-2xl flex flex-col">
              {/* Panel header */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
                <h2 className="text-base font-extrabold text-gray-900">Group Details</h2>
                <button
                  onClick={() => setSelectedGroup(null)}
                  className="size-8 rounded-xl border border-gray-200 flex items-center justify-center text-gray-400 hover:bg-gray-50 transition-colors"
                >
                  <X className="size-4" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
                {/* Activity info */}
                <div className="space-y-3">
                  {meta?.image && (
                    <img
                      src={meta.image}
                      alt={meta.name}
                      className="w-full h-40 object-cover rounded-2xl"
                    />
                  )}
                  <h3 className="text-lg font-extrabold text-gray-900 leading-snug">
                    {selectedGroup.nameOfActivity}
                  </h3>
                  <div className="space-y-1.5">
                    <p className="text-sm text-gray-500 flex items-center gap-2">
                      <Calendar className="size-4 text-gray-400 shrink-0" />
                      {meta
                        ? format(new Date(meta.date), 'EEEE, MMMM d, yyyy')
                        : format(new Date(selectedGroup.createdAt), 'EEEE, MMMM d, yyyy')}
                    </p>
                    <p className="text-sm text-gray-500 flex items-center gap-2">
                      <MapPin className="size-4 text-gray-400 shrink-0" />
                      {meta?.location ?? '—'}
                    </p>
                  </div>
                  <span className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${statusStyle[selectedGroup.activityStatus] ?? 'bg-gray-100 text-gray-500'}`}>
                    {selectedGroup.activityStatus}
                  </span>
                </div>

                {/* Members */}
                <div>
                  <p className="text-xs font-extrabold text-gray-400 uppercase tracking-widest mb-3">
                    Booked Members ({selectedGroup.members.length})
                  </p>
                  <div className="space-y-2">
                    {selectedGroup.members.map((member, i) => (
                      <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                        <div className="size-9 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center text-white text-sm font-bold shrink-0">
                          {member.name.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-800 truncate">{member.name}</p>
                        </div>
                        {member.isPaymentCompleted ? (
                          <span className="flex items-center gap-1 text-[10px] font-bold bg-green-100 text-green-600 px-2 py-0.5 rounded-full shrink-0">
                            <CheckCircle className="size-3" /> Paid
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-[10px] font-bold bg-amber-100 text-amber-600 px-2 py-0.5 rounded-full shrink-0">
                            <XCircle className="size-3" /> Unpaid
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </aside>
          </>
        );
      })()}
    </div>
  );
}
