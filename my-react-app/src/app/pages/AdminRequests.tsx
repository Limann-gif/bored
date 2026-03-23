import { useNavigate } from 'react-router';
import { useApp } from '../context/AppContext';
import { Sidebar } from '../components/Sidebar';
import { mockUsers } from '../data/mockData';
import { ArrowLeft, CheckCircle, XCircle, Clock, Users, MapPin, Inbox, Ban, Calendar } from 'lucide-react';

export default function AdminRequests() {
  const { userSelections, activities, groups, updateGroupStatus, removeSelection } = useApp();
  const navigate = useNavigate();

  const getActivity = (activityId: string) => activities.find(a => a.id === activityId);
  const getUser = (userId: string) => mockUsers.find(u => u.id === userId);

  const formingGroups = groups.filter(g => g.status === 'forming');
  const approvedGroups = groups.filter(g => g.status === 'confirmed');
  const cancelledGroups = groups.filter(g => g.status === 'cancelled');
  const totalPending = userSelections.length + formingGroups.length;

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
            <h1 className="text-xl font-extrabold text-gray-900">Review Join Requests</h1>
            <p className="text-sm text-gray-400 mt-0.5">Manage pending activity selections and forming groups.</p>
          </div>
          {totalPending > 0 && (
            <span className="ml-auto text-xs font-bold bg-amber-100 text-amber-600 px-3 py-1.5 rounded-full">
              {totalPending} pending
            </span>
          )}
        </div>

        <div className="px-8 py-6 space-y-8">
          {/* Pending Selections */}
          <section>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="size-7 rounded-lg bg-amber-50 flex items-center justify-center">
                <Clock className="size-4 text-amber-500" />
              </div>
              <div>
                <h2 className="text-sm font-extrabold text-gray-800">Pending Selections</h2>
                <p className="text-xs text-gray-400">Users who have chosen an activity and are waiting to be matched.</p>
              </div>
              <span className="ml-auto text-xs text-gray-400 font-semibold">{userSelections.length} selection{userSelections.length !== 1 ? 's' : ''}</span>
            </div>

            {userSelections.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm py-14 text-center">
                <Inbox className="size-8 text-gray-200 mx-auto mb-3" />
                <p className="text-sm font-semibold text-gray-400">No pending selections</p>
                <p className="text-xs text-gray-300 mt-1">Users are matched automatically when enough members select the same activity.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {userSelections.map(sel => {
                  const activity = getActivity(sel.activityId);
                  const user = getUser(sel.userId);
                  const userName = user?.name ?? 'Current User';
                  return (
                    <div key={`${sel.userId}-${sel.activityId}`} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                      {activity?.image && (
                        <div className="h-28 relative overflow-hidden">
                          <img src={activity.image} alt={activity.name} className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                          <span className="absolute bottom-2 left-3 text-white text-xs font-bold">{activity.name}</span>
                        </div>
                      )}
                      <div className="p-4 space-y-3">
                        <div className="flex items-center gap-2">
                          <div className="size-8 rounded-full bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center text-white text-xs font-bold">
                            {userName.charAt(0)}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-800">{userName}</p>
                            <p className="text-xs text-gray-400">
                              {new Date(sel.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-gray-400">
                          <MapPin className="size-3" />
                          {sel.location.address}
                        </div>
                        <div className="flex gap-2 pt-1">
                          <button
                            onClick={() => removeSelection(sel.userId, sel.activityId)}
                            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold text-red-500 bg-red-50 hover:bg-red-100 transition-colors"
                          >
                            <XCircle className="size-3.5" /> Reject
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* Approved Requests */}
          <section>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="size-7 rounded-lg bg-green-50 flex items-center justify-center">
                <CheckCircle className="size-4 text-green-500" />
              </div>
              <div>
                <h2 className="text-sm font-extrabold text-gray-800">Approved Requests</h2>
                <p className="text-xs text-gray-400">Groups that have been confirmed and are ready to go.</p>
              </div>
              <span className="ml-auto text-xs text-gray-400 font-semibold">{approvedGroups.length} group{approvedGroups.length !== 1 ? 's' : ''}</span>
            </div>

            {approvedGroups.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm py-14 text-center">
                <Inbox className="size-8 text-gray-200 mx-auto mb-3" />
                <p className="text-sm font-semibold text-gray-400">No approved groups yet</p>
                <p className="text-xs text-gray-300 mt-1">Confirmed groups will appear here.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {approvedGroups.map(group => {
                  const activity = getActivity(group.activityId);
                  return (
                    <div key={group.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                      {activity?.image && (
                        <div className="h-28 relative overflow-hidden">
                          <img src={activity.image} alt={activity.name} className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                          <span className="absolute bottom-2 left-3 text-white text-xs font-bold">{activity.name}</span>
                          <span className="absolute top-2.5 right-2.5 bg-green-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                            <CheckCircle className="size-2.5" /> Confirmed
                          </span>
                        </div>
                      )}
                      <div className="p-4 space-y-3">
                        <div className="flex -space-x-2">
                          {group.members.slice(0, 5).map((m, i) => (
                            <div
                              key={i}
                              className="size-8 rounded-full border-2 border-white bg-gradient-to-br from-green-400 to-teal-500 flex items-center justify-center text-white text-[9px] font-bold"
                              title={m.name}
                            >
                              {m.name.charAt(0)}
                            </div>
                          ))}
                          {group.members.length > 5 && (
                            <div className="size-8 rounded-full border-2 border-white bg-gray-200 flex items-center justify-center text-[9px] font-bold text-gray-500">
                              +{group.members.length - 5}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center justify-between text-xs text-gray-400">
                          <span className="flex items-center gap-1"><Users className="size-3" /> {group.members.length} members</span>
                          <span className="flex items-center gap-1">
                            <Calendar className="size-3" />
                            {new Date(group.activityDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </span>
                        </div>
                        <button
                          onClick={() => updateGroupStatus(group.id, 'cancelled')}
                          className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold text-red-500 bg-red-50 hover:bg-red-100 transition-colors"
                        >
                          <XCircle className="size-3.5" /> Revoke Approval
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* Forming Groups */}
          <section>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="size-7 rounded-lg bg-purple-50 flex items-center justify-center">
                <Users className="size-4 text-purple-500" />
              </div>
              <div>
                <h2 className="text-sm font-extrabold text-gray-800">Forming Groups</h2>
                <p className="text-xs text-gray-400">Groups still assembling members. Approve to confirm or dissolve to cancel.</p>
              </div>
              <span className="ml-auto text-xs text-gray-400 font-semibold">{formingGroups.length} group{formingGroups.length !== 1 ? 's' : ''}</span>
            </div>

            {formingGroups.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm py-14 text-center">
                <Inbox className="size-8 text-gray-200 mx-auto mb-3" />
                <p className="text-sm font-semibold text-gray-400">No forming groups</p>
                <p className="text-xs text-gray-300 mt-1">Groups in the forming stage will appear here.</p>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50/60">
                      <th className="px-6 py-3.5 text-left text-xs font-extrabold text-gray-400 uppercase tracking-wider">Activity</th>
                      <th className="px-6 py-3.5 text-left text-xs font-extrabold text-gray-400 uppercase tracking-wider">Members</th>
                      <th className="px-6 py-3.5 text-left text-xs font-extrabold text-gray-400 uppercase tracking-wider">Spots Left</th>
                      <th className="px-6 py-3.5 text-left text-xs font-extrabold text-gray-400 uppercase tracking-wider">Created</th>
                      <th className="px-6 py-3.5 text-left text-xs font-extrabold text-gray-400 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {formingGroups.map(group => {
                      const activity = getActivity(group.activityId);
                      const spotsLeft = (activity?.groupSize.max ?? 6) - group.members.length;
                      return (
                        <tr key={group.id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="px-6 py-4">
                            <p className="text-sm font-semibold text-gray-800">{activity?.name ?? 'Unknown'}</p>
                            <p className="text-xs text-gray-400">{group.id.slice(0, 10)}…</p>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex -space-x-2">
                              {group.members.slice(0, 4).map((m, i) => (
                                <div
                                  key={i}
                                  className="size-7 rounded-full border-2 border-white bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center text-white text-[9px] font-bold"
                                  title={m.name}
                                >
                                  {m.name.charAt(0)}
                                </div>
                              ))}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${spotsLeft > 0 ? 'bg-amber-50 text-amber-600' : 'bg-green-50 text-green-600'}`}>
                              {spotsLeft > 0 ? `${spotsLeft} open` : 'Full'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-400">
                            {new Date(group.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex gap-2">
                              <button
                                onClick={() => updateGroupStatus(group.id, 'confirmed')}
                                className="flex items-center gap-1.5 text-xs font-bold text-green-600 bg-green-50 hover:bg-green-100 px-3 py-1.5 rounded-lg transition-colors"
                              >
                                <CheckCircle className="size-3.5" /> Approve
                              </button>
                              <button
                                onClick={() => updateGroupStatus(group.id, 'cancelled')}
                                className="flex items-center gap-1.5 text-xs font-bold text-red-500 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition-colors"
                              >
                                <XCircle className="size-3.5" /> Dissolve
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>
          {/* Cancelled Requests */}
          <section>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="size-7 rounded-lg bg-red-50 flex items-center justify-center">
                <Ban className="size-4 text-red-400" />
              </div>
              <div>
                <h2 className="text-sm font-extrabold text-gray-800">Cancelled Requests</h2>
                <p className="text-xs text-gray-400">Groups that were dissolved or rejected. Can be reinstated if needed.</p>
              </div>
              <span className="ml-auto text-xs text-gray-400 font-semibold">{cancelledGroups.length} group{cancelledGroups.length !== 1 ? 's' : ''}</span>
            </div>

            {cancelledGroups.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm py-14 text-center">
                <Inbox className="size-8 text-gray-200 mx-auto mb-3" />
                <p className="text-sm font-semibold text-gray-400">No cancelled requests</p>
                <p className="text-xs text-gray-300 mt-1">Dissolved or rejected groups will appear here.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {cancelledGroups.map(group => {
                  const activity = getActivity(group.activityId);
                  return (
                    <div key={group.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden opacity-75">
                      {activity?.image && (
                        <div className="h-28 relative overflow-hidden grayscale">
                          <img src={activity.image} alt={activity.name} className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                          <span className="absolute bottom-2 left-3 text-white text-xs font-bold">{activity.name}</span>
                          <span className="absolute top-2.5 right-2.5 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                            <XCircle className="size-2.5" /> Cancelled
                          </span>
                        </div>
                      )}
                      <div className="p-4 space-y-3">
                        <div className="flex -space-x-2">
                          {group.members.slice(0, 5).map((m, i) => (
                            <div
                              key={i}
                              className="size-8 rounded-full border-2 border-white bg-gray-300 flex items-center justify-center text-white text-[9px] font-bold"
                              title={m.name}
                            >
                              {m.name.charAt(0)}
                            </div>
                          ))}
                          {group.members.length > 5 && (
                            <div className="size-8 rounded-full border-2 border-white bg-gray-200 flex items-center justify-center text-[9px] font-bold text-gray-500">
                              +{group.members.length - 5}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center justify-between text-xs text-gray-400">
                          <span className="flex items-center gap-1"><Users className="size-3" /> {group.members.length} members</span>
                          <span className="flex items-center gap-1">
                            <Calendar className="size-3" />
                            {new Date(group.activityDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </span>
                        </div>
                        <button
                          onClick={() => updateGroupStatus(group.id, 'confirmed')}
                          className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold text-green-600 bg-green-50 hover:bg-green-100 transition-colors"
                        >
                          <CheckCircle className="size-3.5" /> Reinstate
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
