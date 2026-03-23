import { useNavigate } from 'react-router';
import { useApp } from '../context/AppContext';
import { Sidebar } from '../components/Sidebar';
import {
  Users,
  Layers,
  Star,
  MessageSquareWarning,
  Clock,
  Activity,
  ChevronRight,
  Flag,
  BarChart3,
  UserCheck,
} from 'lucide-react';
import { mockUsers } from '../data/mockData';

// Derived from real app data + plausible mock values for demo
const MOCK_AVG_RATING = 4.7;
const MOCK_OPEN_COMPLAINTS = 3;

type StatCardProps = {
  label: string;
  value: string | number;
  sub?: string;
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  trend?: { value: string; positive: boolean };
};

function StatCard({ label, value, sub, icon: Icon, iconBg, iconColor, trend }: StatCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col gap-3">
      <div className="flex items-start justify-between">
        <div className={`size-10 rounded-xl flex items-center justify-center ${iconBg}`}>
          <Icon className={`size-5 ${iconColor}`} />
        </div>
        {trend && (
          <span
            className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
              trend.positive
                ? 'bg-green-50 text-green-600'
                : 'bg-red-50 text-red-500'
            }`}
          >
            {trend.positive ? '↑' : '↓'} {trend.value}
          </span>
        )}
      </div>
      <div>
        <p className="text-2xl font-extrabold text-gray-900 leading-none">{value}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
        <p className="text-sm text-gray-500 font-medium mt-1">{label}</p>
      </div>
    </div>
  );
}

type ActionCardProps = {
  title: string;
  description: string;
  icon: React.ElementType;
  gradient: string;
  badge?: string | number;
  badgeColor?: string;
  onClick: () => void;
};

function ActionCard({ title, description, icon: Icon, gradient, badge, badgeColor = 'bg-white/20', onClick }: ActionCardProps) {
  return (
    <button
      onClick={onClick}
      className={`relative text-left rounded-2xl p-5 ${gradient} text-white group hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="size-10 bg-white/20 rounded-xl flex items-center justify-center">
          <Icon className="size-5 text-white" />
        </div>
        {badge !== undefined && (
          <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${badgeColor} text-white`}>
            {badge}
          </span>
        )}
      </div>
      <h3 className="font-extrabold text-base leading-tight mb-1">{title}</h3>
      <p className="text-white/75 text-xs leading-relaxed">{description}</p>
      <div className="mt-4 flex items-center gap-1 text-white/80 text-xs font-semibold group-hover:text-white transition-colors">
        Open <ChevronRight className="size-3.5" />
      </div>
    </button>
  );
}

export default function Admin() {
  const { groups, activities } = useApp();
  const navigate = useNavigate();

  const totalGroups = groups.length;
  const pendingRequests = groups.filter(g => g.status === 'forming').length;
  const confirmedGroups = groups.filter(g => g.status === 'confirmed').length;
  const totalUsers = mockUsers.length + 1; // +1 for current user
  const totalActivities = activities.length;

  const recentGroups = [...groups]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  const statusStyles: Record<string, string> = {
    forming: 'bg-amber-50 text-amber-600',
    confirmed: 'bg-green-50 text-green-600',
    completed: 'bg-blue-50 text-blue-600',
    cancelled: 'bg-red-50 text-red-500',
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />

      <main className="flex-1 overflow-auto min-w-0">
        {/* Top bar */}
        <div className="bg-white border-b border-gray-100 px-8 py-5 flex items-center justify-between sticky top-0 z-40">
          <div>
            <h1 className="text-xl font-extrabold text-gray-900">Admin Dashboard</h1>
            <p className="text-sm text-gray-400 mt-0.5">Platform overview and management tools.</p>
          </div>
          <div className="flex items-center gap-2.5">
            <span className="text-xs text-gray-400 font-medium">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </span>
            <div className="size-2 rounded-full bg-green-400" title="System operational" />
          </div>
        </div>

        <div className="px-8 py-6 space-y-8">
          {/* Stats grid */}
          <section>
            <h2 className="text-xs font-extrabold text-gray-400 uppercase tracking-widest mb-4">Key Metrics</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-4">
              <StatCard
                label="Total Groups"
                value={totalGroups}
                sub="all time"
                icon={Layers}
                iconBg="bg-purple-50"
                iconColor="text-purple-500"
                trend={{ value: '12%', positive: true }}
              />
              <StatCard
                label="Pending Requests"
                value={pendingRequests}
                sub="currently forming"
                icon={Clock}
                iconBg="bg-amber-50"
                iconColor="text-amber-500"
              />
              <StatCard
                label="Confirmed Groups"
                value={confirmedGroups}
                sub="active this week"
                icon={UserCheck}
                iconBg="bg-green-50"
                iconColor="text-green-500"
                trend={{ value: '8%', positive: true }}
              />
              <StatCard
                label="Registered Users"
                value={totalUsers}
                sub="across all plans"
                icon={Users}
                iconBg="bg-blue-50"
                iconColor="text-blue-500"
                trend={{ value: '5%', positive: true }}
              />
              <StatCard
                label="Avg Rating"
                value={`${MOCK_AVG_RATING}★`}
                sub="from all groups"
                icon={Star}
                iconBg="bg-pink-50"
                iconColor="text-pink-500"
                trend={{ value: '0.2', positive: true }}
              />
              <StatCard
                label="Open Complaints"
                value={MOCK_OPEN_COMPLAINTS}
                sub="needs attention"
                icon={MessageSquareWarning}
                iconBg="bg-red-50"
                iconColor="text-red-400"
              />
            </div>
          </section>

          {/* Quick Actions */}
          <section>
            <h2 className="text-xs font-extrabold text-gray-400 uppercase tracking-widest mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <ActionCard
                title="Manage Groups"
                description="View all active, forming, and completed groups. Approve or dissolve groups as needed."
                icon={Layers}
                gradient="bg-gradient-to-br from-purple-600 to-purple-800"
                badge={totalGroups}
                onClick={() => navigate('/admin/groups')}
              />
              <ActionCard
                title="Review Join Requests"
                description="Process pending group join requests and match members to activities."
                icon={Clock}
                gradient="bg-gradient-to-br from-amber-500 to-orange-600"
                badge={pendingRequests}
                onClick={() => navigate('/admin/requests')}
              />
              <ActionCard
                title="Manage Activities"
                description="Add, edit, or remove activities. Set capacity limits and schedules."
                icon={Activity}
                gradient="bg-gradient-to-br from-pink-500 to-rose-600"
                badge={totalActivities}
                onClick={() => navigate('/admin/activities')}
              />
              <ActionCard
                title="Handle Complaints"
                description="Review and resolve user-submitted complaints and reports against groups or members."
                icon={Flag}
                gradient="bg-gradient-to-br from-red-500 to-red-700"
                badge={MOCK_OPEN_COMPLAINTS}
                badgeColor="bg-red-400"
                onClick={() => navigate('/admin/complaints')}
              />
              <ActionCard
                title="User Management"
                description="View user profiles, manage subscription statuses, and suspend accounts."
                icon={Users}
                gradient="bg-gradient-to-br from-blue-500 to-indigo-600"
                badge={totalUsers}
                onClick={() => navigate('/admin/users')}
              />
              <ActionCard
                title="Payment & Billing"
                description="View revenue, manage subscriptions, and review transaction history."
                icon={BarChart3}
                gradient="bg-gradient-to-br from-teal-500 to-green-600"
                onClick={() => navigate('/admin/billing')}
              />
            </div>
          </section>

          {/* Recent Groups */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xs font-extrabold text-gray-400 uppercase tracking-widest">Recent Groups</h2>
              <button
                onClick={() => navigate('/admin/groups')}
                className="text-xs text-pink-500 font-semibold hover:underline flex items-center gap-1"
              >
                View all <ChevronRight className="size-3.5" />
              </button>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              {recentGroups.length === 0 ? (
                <div className="py-16 text-center text-gray-400 text-sm">
                  No groups formed yet.
                </div>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-100 text-left">
                      <th className="px-6 py-3.5 text-xs font-extrabold text-gray-400 uppercase tracking-wider">Group ID</th>
                      <th className="px-6 py-3.5 text-xs font-extrabold text-gray-400 uppercase tracking-wider">Activity</th>
                      <th className="px-6 py-3.5 text-xs font-extrabold text-gray-400 uppercase tracking-wider">Members</th>
                      <th className="px-6 py-3.5 text-xs font-extrabold text-gray-400 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3.5 text-xs font-extrabold text-gray-400 uppercase tracking-wider">Created</th>
                      <th className="px-6 py-3.5 text-xs font-extrabold text-gray-400 uppercase tracking-wider" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {recentGroups.map(group => {
                      const activity = activities.find(a => a.id === group.activityId);
                      return (
                        <tr key={group.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 text-xs font-mono text-gray-400">{group.id.slice(0, 10)}…</td>
                          <td className="px-6 py-4">
                            <span className="text-sm font-semibold text-gray-800">
                              {activity?.name ?? 'Unknown Activity'}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex -space-x-2">
                              {group.members.slice(0, 4).map((m, i) => (
                                <div
                                  key={i}
                                  className="size-7 rounded-full border-2 border-white bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center text-white text-[9px] font-bold"
                                >
                                  {m.name.charAt(0)}
                                </div>
                              ))}
                              {group.members.length > 4 && (
                                <div className="size-7 rounded-full border-2 border-white bg-gray-200 flex items-center justify-center text-gray-500 text-[9px] font-bold">
                                  +{group.members.length - 4}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${statusStyles[group.status] ?? 'bg-gray-100 text-gray-500'}`}>
                              {group.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-400">
                            {new Date(group.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </td>
                          <td className="px-6 py-4">
                            <button
                              onClick={() => navigate('/admin/groups')}
                              className="text-pink-500 hover:text-pink-600 transition-colors"
                            >
                              <ChevronRight className="size-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </section>

          {/* Platform Health */}
          <section>
            <h2 className="text-xs font-extrabold text-gray-400 uppercase tracking-widest mb-4">Platform Health</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <div className="flex items-center gap-2.5 mb-3">
                  <div className="size-2.5 rounded-full bg-green-400" />
                  <span className="text-sm font-bold text-gray-700">Matching Engine</span>
                </div>
                <p className="text-xs text-gray-400 leading-relaxed">
                  All group matching algorithms are running normally. Average match time is under 2 minutes.
                </p>
              </div>
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <div className="flex items-center gap-2.5 mb-3">
                  <div className="size-2.5 rounded-full bg-green-400" />
                  <span className="text-sm font-bold text-gray-700">Payments & Billing</span>
                </div>
                <p className="text-xs text-gray-400 leading-relaxed">
                  No failed transactions in the last 24 hours. Subscription renewals are processing correctly.
                </p>
              </div>
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <div className="flex items-center gap-2.5 mb-3">
                  <div className="size-2.5 rounded-full bg-amber-400" />
                  <span className="text-sm font-bold text-gray-700">Notifications</span>
                </div>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Email delivery rate at 94%. Push notifications delayed by ~30s due to provider maintenance.
                </p>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
