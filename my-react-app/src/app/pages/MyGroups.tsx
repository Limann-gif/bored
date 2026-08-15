import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { useApp } from '../context/AppContext';
import { Header } from '../components/Header';
import { Button } from '../components/ui/button';
import {
  Calendar,
  CheckCircle2,
  Clock,
  MapPin,
  PartyPopper,
  Sparkles,
  Users,
} from 'lucide-react';
import { format } from 'date-fns';
import { apiService, type ActivityBookingOrderRecord } from '../../services/api';
import type { Activity } from '../types';

type HistoryActivity = ActivityBookingOrderRecord & {
  historyStatus: string;
  key: string;
  details?: Activity;
};

const statusStyles: Record<string, string> = {
  forming: 'bg-amber-100 text-amber-700',
  booked: 'bg-amber-100 text-amber-700',
  confirmed: 'bg-emerald-100 text-emerald-700',
  completed: 'bg-blue-100 text-blue-700',
  cancelled: 'bg-red-100 text-red-600',
};

function statusLabel(status: string) {
  return status.toLowerCase() === 'forming' ? 'Booked' : status;
}

function MemberAvatar({ name, index }: { name: string; index: number }) {
  const colors = [
    'from-purple-400 to-pink-400', 'from-blue-400 to-cyan-400', 'from-orange-400 to-amber-400',
    'from-green-400 to-teal-400', 'from-rose-400 to-pink-500', 'from-indigo-400 to-violet-400',
  ];
  return (
    <div className={`flex size-9 items-center justify-center rounded-full bg-gradient-to-br ${colors[index % colors.length]} text-sm font-bold text-white shadow-sm ring-2 ring-white`}>
      {(name.trim().charAt(0) || '?').toUpperCase()}
    </div>
  );
}

function ActivityHistoryCard({ activity, onPay }: { activity: HistoryActivity; onPay?: () => void }) {
  const status = (activity.status || activity.historyStatus).toLowerCase();
  const isBooked = status === 'forming' || status === 'booked' || status === 'pending';
  const eventDate = activity.details?.activityDate ?? new Date(activity.activityDate);
  const image = activity.details?.image || activity.imageUrl;
  const description = activity.details?.description || activity.description;
  const location = activity.details?.location || activity.location;

  return (
    <article className="overflow-hidden rounded-2xl border-0 bg-white shadow-md transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl">
      <div className="grid md:grid-cols-[320px_1fr]">
        {image ? (
          <img src={image} alt={activity.name} className="h-56 w-full object-cover md:h-full" />
        ) : (
          <div className="min-h-56 bg-gradient-to-br from-purple-500 via-violet-500 to-pink-500" />
        )}

        <div className="p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-2xl font-extrabold text-gray-900">{activity.name}</h2>
              {description && <p className="mt-2 text-sm leading-relaxed text-gray-500">{description}</p>}
            </div>
            <div className="flex flex-col items-end gap-2">
              <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold capitalize ${statusStyles[status] ?? 'bg-gray-100 text-gray-600'}`}>
                {statusLabel(status)}
              </span>
              <span className="text-lg font-extrabold text-pink-500">GH₵{activity.price}</span>
            </div>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <div className="flex items-start gap-3 rounded-xl bg-purple-50 p-3">
              <Calendar className="mt-0.5 size-5 shrink-0 text-purple-500" />
              <div><p className="text-xs font-bold uppercase tracking-wider text-purple-400">Date</p><p className="mt-0.5 text-sm font-semibold text-gray-800">{Number.isNaN(eventDate.getTime()) ? 'To be confirmed' : format(eventDate, 'EEEE, MMM d, yyyy')}</p></div>
            </div>
            <div className="flex items-start gap-3 rounded-xl bg-pink-50 p-3">
              <MapPin className="mt-0.5 size-5 shrink-0 text-pink-500" />
              <div><p className="text-xs font-bold uppercase tracking-wider text-pink-400">Meeting Point</p><p className="mt-0.5 text-sm font-semibold text-gray-800">{location || 'To be confirmed'}</p></div>
            </div>
          </div>

          <div className="mt-5 border-t border-gray-100 pt-5">
            <div className="mb-3 flex items-center gap-2"><Users className="size-4 text-gray-500" /><p className="text-sm font-semibold text-gray-700">Your Group <span className="ml-1.5 text-xs font-normal text-gray-400">({activity.groupMembers.length} people)</span></p></div>
            {activity.groupMembers.length > 0 ? (
              <div className="flex -space-x-2.5">{activity.groupMembers.slice(0, 6).map((member, index) => <MemberAvatar key={`${member}-${index}`} name={member} index={index} />)}{activity.groupMembers.length > 6 && <div className="flex size-9 items-center justify-center rounded-full bg-gray-100 text-xs font-bold text-gray-500 ring-2 ring-white">+{activity.groupMembers.length - 6}</div>}</div>
            ) : <p className="text-xs text-gray-400">Group members are not available yet.</p>}
          </div>

          {isBooked && activity.orderId && onPay && (
            <div className="mt-5 flex items-center justify-between rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3">
              <div><p className="text-sm font-bold text-amber-700">Payment pending</p><p className="mt-0.5 text-xs text-amber-500">Complete payment to confirm your spot</p></div>
              <Button size="sm" onClick={onPay} className="shrink-0 bg-gradient-to-r from-pink-500 to-purple-600 text-white hover:opacity-90">Make Payment</Button>
            </div>
          )}

          {activity.cancellationReason && (
            <p className="mt-4 rounded-xl bg-red-50 px-3 py-2 text-xs font-medium text-red-600">
              Cancellation reason: {activity.cancellationReason}
            </p>
          )}
        </div>
      </div>
    </article>
  );
}

export default function MyGroups() {
  const { activities: availableActivities } = useApp();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<ActivityBookingOrderRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    setError('');
    apiService.getAllGroupsActivityHistory()
      .then(setOrders)
      .catch((requestError: Error) => setError(requestError.message))
      .finally(() => setLoading(false));
  }, []);

  const activities = useMemo(() => orders.map((order, index) => ({
    ...order,
    historyStatus: order.status,
    key: order.orderId || `${order.activityId}-${order.status}-${index}`,
    details: availableActivities.find(activity => activity.id === order.activityId),
  })), [orders, availableActivities]);

  const activitiesByStatus = useMemo(() => activities.reduce<Record<string, HistoryActivity[]>>((groups, activity) => {
    const rawStatus = (activity.status || activity.historyStatus || 'booked').toLowerCase();
    const status = rawStatus === 'forming' || rawStatus === 'pending' ? 'booked' : rawStatus;
    (groups[status] ??= []).push(activity);
    return groups;
  }, {}), [activities]);
  const orderedStatuses = ['booked', 'confirmed', 'completed', 'cancelled'];
  const statusSections = [
    ...orderedStatuses.filter(status => activitiesByStatus[status]?.length),
    ...Object.keys(activitiesByStatus).filter(status => !orderedStatuses.includes(status)),
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 via-white to-gray-50">
      <Header />

      <div className="relative overflow-hidden bg-gradient-to-r from-purple-600 via-violet-600 to-pink-500 text-white">
        <div className="relative container mx-auto px-4 py-10">
          <div className="mb-2 flex items-center gap-3">
            <Sparkles className="size-7 text-yellow-300" />
            <h1 className="text-4xl font-extrabold tracking-tight">My Adventures</h1>
          </div>
          <p className="max-w-md text-lg text-purple-100">Your activity history, all in one place.</p>
          <div className="mt-6 flex items-center gap-6">
            <div className="text-center">
              <p className="text-3xl font-bold">{activitiesByStatus.booked?.length ?? 0}</p>
              <p className="mt-0.5 text-xs uppercase tracking-wider text-purple-200">Booked</p>
            </div>
            <div className="h-10 w-px bg-white/20" />
            <div className="text-center">
              <p className="text-3xl font-bold">{activitiesByStatus.confirmed?.length ?? 0}</p>
              <p className="mt-0.5 text-xs uppercase tracking-wider text-purple-200">Confirmed</p>
            </div>
          </div>
        </div>
      </div>

      <main className="container mx-auto space-y-10 px-4 py-10">
        {loading ? (
          <div className="py-24 text-center text-sm text-gray-400">Loading your activities…</div>
        ) : error ? (
          <div role="alert" className="rounded-2xl bg-red-50 px-6 py-5 text-center text-sm font-medium text-red-600">{error}</div>
        ) : activities.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="mb-6 flex size-24 items-center justify-center rounded-full bg-gradient-to-br from-purple-100 to-pink-100">
              <PartyPopper className="size-12 text-purple-400" />
            </div>
            <h2 className="mb-2 text-2xl font-bold text-gray-800">No adventures yet!</h2>
            <p className="mb-8 max-w-sm text-gray-500">Join an activity to begin making memories.</p>
            <Button onClick={() => navigate('/activities')} className="bg-gradient-to-r from-purple-600 to-pink-500 px-8 text-white hover:from-purple-700 hover:to-pink-600">
              <Sparkles className="mr-2 size-4" /> Browse Activities
            </Button>
          </div>
        ) : (
          <>
            {statusSections.map(status => (
              <section key={status}>
                <div className="mb-5 flex items-center gap-3">
                  <div className="rounded-xl bg-violet-100 p-2">
                    {status === 'booked' ? <Clock className="size-5 text-violet-600" /> : <CheckCircle2 className="size-5 text-violet-600" />}
                  </div>
                  <h2 className="text-2xl font-bold capitalize text-gray-900">{statusLabel(status)} Activities</h2>
                  <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-bold text-gray-500">{activitiesByStatus[status].length}</span>
                </div>
                <div className="grid gap-6">{activitiesByStatus[status].map(activity => <ActivityHistoryCard key={activity.key} activity={activity} onPay={() => navigate(`/payment/${activity.orderId}`)} />)}</div>
              </section>
            ))}
          </>
        )}
      </main>
    </div>
  );
}
