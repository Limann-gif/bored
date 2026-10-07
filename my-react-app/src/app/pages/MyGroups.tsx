import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext';
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
import { toast } from 'sonner';
import { apiService, type UserActivityHistoryItem } from '../../services/api';

type HistoryActivity = UserActivityHistoryItem & {
  groupMembers: string[];
  historyStatus: string;
  key: string;
};

const statusStyles: Record<string, string> = {
  forming: 'bg-amber-100 text-amber-700',
  booked: 'bg-amber-100 text-amber-700',
  confirmed: 'bg-emerald-100 text-emerald-700',
  completed: 'bg-blue-100 text-blue-700',
  cancelled: 'bg-red-100 text-red-600',
  paid: 'bg-emerald-100 text-emerald-700',
  requestrefund: 'bg-orange-100 text-orange-700',
};

function statusLabel(status: string) {
  return status === 'requestrefund' ? 'Refund requested' : status.toLowerCase() === 'forming' ? 'Booked' : status;
}

function MemberAvatar({ name, index }: { name: string; index: number }) {
  const colors = [
    'from-orange-400 to-orange-400', 'from-blue-400 to-cyan-400', 'from-orange-400 to-amber-400',
    'from-green-400 to-teal-400', 'from-rose-400 to-orange-500', 'from-orange-400 to-orange-400',
  ];
  return (
    <div className={`flex size-9 items-center justify-center rounded-full bg-gradient-to-br ${colors[index % colors.length]} text-sm font-bold text-white shadow-sm ring-2 ring-white`}>
      {(name.trim().split(/\s+/).map(part => part.charAt(0)).slice(0, 2).join('') || '?').toUpperCase()}
    </div>
  );
}

function ActivityHistoryCard({ activity, onPay, onCancel, cancelling }: { activity: HistoryActivity; onPay?: () => void; onCancel: (paid: boolean) => void; cancelling: boolean }) {
  const status = (activity.confirmationStatus || activity.status || activity.historyStatus).trim().toLowerCase();
  const showMemberNames = activity.confirmationStatus?.trim().toLowerCase() === 'confirmed';
  const isBooked = status === 'forming' || status === 'booked' || status === 'pending';
  const isPaid = [activity.paymentStatus, activity.status, activity.historyStatus, status].some(value => value?.trim().toLowerCase() === 'paid');
  const canCancel = !['cancelled', 'canceled', 'completed', 'requestrefund', 'refunded'].includes(status) && (isBooked || isPaid);
  const eventDate = new Date(activity.activityDate);
  const image = activity.imageUrl;
  const description = activity.description;
  const location = activity.location;

  return (
    <article className="overflow-hidden rounded-2xl border-0 bg-white shadow-md transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl">
      <div className="grid md:grid-cols-[320px_1fr]">
        {image ? (
          <img src={image} alt={activity.name} className="h-56 w-full object-cover md:h-full" />
        ) : (
          <div className="min-h-56 bg-gradient-to-br from-orange-500 via-orange-500 to-orange-500" />
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
              {canCancel && <Button size="sm" variant="outline" disabled={cancelling} onClick={() => onCancel(isPaid)} className="text-red-600 border-red-200 hover:bg-red-50">{cancelling ? 'Submitting…' : isPaid ? 'Cancel & request refund' : 'Cancel booking'}</Button>}
              <span className="text-lg font-extrabold text-orange-500">GH₵{activity.price}</span>
            </div>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <div className="flex items-start gap-3 rounded-xl bg-orange-50 p-3">
              <Calendar className="mt-0.5 size-5 shrink-0 text-orange-500" />
              <div><p className="text-xs font-bold uppercase tracking-wider text-orange-400">Date</p><p className="mt-0.5 text-sm font-semibold text-gray-800">{Number.isNaN(eventDate.getTime()) ? 'To be confirmed' : format(eventDate, 'EEEE, MMM d, yyyy')}</p></div>
            </div>
            <div className="flex items-start gap-3 rounded-xl bg-orange-50 p-3">
              <MapPin className="mt-0.5 size-5 shrink-0 text-orange-500" />
              <div><p className="text-xs font-bold uppercase tracking-wider text-orange-400">Meeting Point</p><p className="mt-0.5 text-sm font-semibold text-gray-800">{location || 'To be confirmed'}</p></div>
            </div>
          </div>

          <div className="mt-5 border-t border-gray-100 pt-5">
            <div className="mb-3 flex items-center gap-2"><Users className="size-4 text-gray-500" /><p className="text-sm font-semibold text-gray-700">Your Group <span className="ml-1.5 text-xs font-normal text-gray-400">({activity.groupMembers.length} people)</span></p></div>
            {activity.groupMembers.length > 0 && showMemberNames ? (
              <ul className="flex flex-wrap gap-3">
                {activity.groupMembers.map((member, index) => (
                  <li key={`${member}-${index}`} className="flex items-center gap-2 rounded-xl bg-orange-50 px-3 py-2">
                    <MemberAvatar name={member} index={index} />
                    <span className="text-sm font-semibold text-gray-700">{member}</span>
                  </li>
                ))}
              </ul>
            ) : activity.groupMembers.length > 0 ? (
              <div className="flex -space-x-2.5">{activity.groupMembers.slice(0, 6).map((member, index) => <MemberAvatar key={`${member}-${index}`} name={member} index={index} />)}{activity.groupMembers.length > 6 && <div className="flex size-9 items-center justify-center rounded-full bg-gray-100 text-xs font-bold text-gray-500 ring-2 ring-white">+{activity.groupMembers.length - 6}</div>}</div>
            ) : <p className="text-xs text-gray-400">Group members are not available yet.</p>}
          </div>

          {isBooked && !isPaid && onPay && (
            <div className="mt-5 flex items-center justify-between rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3">
              <div><p className="text-sm font-bold text-amber-700">Payment pending</p><p className="mt-0.5 text-xs text-amber-500">Complete payment to confirm your spot</p></div>
              <Button size="sm" onClick={onPay} className="shrink-0 bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:opacity-90">Make Payment</Button>
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
  const { user } = useAuth();
  const userId = user?.id;
  const navigate = useNavigate();
  const [cancellingIds, setCancellingIds] = useState<Set<string>>(new Set());
  const [orders, setOrders] = useState<HistoryActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    setOrders([]);
    setError('');
    if (!userId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    apiService.getUserActivityHistory(userId)
      .then(history => {
        if (active) setOrders(Object.entries(history).flatMap(([status, bookings]) =>
          bookings.map(booking => ({
            ...booking,
            confirmationStatus: booking.confirmationStatus ?? booking.onfirmationStatus,
            groupMembers: booking.groupParticipants ?? [],
            historyStatus: status,
            key: booking.id,
          }))
        ));
      })
      .catch((requestError: Error) => {
        if (active) setError(requestError.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => { active = false; };
  }, [userId]);

  const cancelBooking = async (activity: HistoryActivity, paid: boolean) => {
    const bookingId = activity.orderId || activity.bookingOrderId || activity.id;
    if (cancellingIds.has(bookingId)) return;
    setCancellingIds(ids => new Set(ids).add(bookingId));
    try {
      const message = paid ? await apiService.requestActivityRefund(bookingId) : await apiService.cancelBookedActivity(bookingId);
      const nextStatus = paid ? 'requestrefund' : 'cancelled';
      setOrders(current => current.map(order => order.key === activity.key ? { ...order, confirmationStatus: nextStatus, historyStatus: nextStatus, status: nextStatus } : order));
      toast.success(message);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not cancel booking');
    } finally {
      setCancellingIds(ids => { const next = new Set(ids); next.delete(bookingId); return next; });
    }
  };

  const activities = orders;

  const activitiesByStatus = useMemo(() => activities.reduce<Record<string, HistoryActivity[]>>((groups, activity) => {
    const rawStatus = (activity.confirmationStatus || activity.status || activity.historyStatus || 'booked').trim().toLowerCase();
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
    <div className="min-h-screen bg-gradient-to-b from-orange-50 via-white to-gray-50">
      <Header />

      <div className="relative overflow-hidden bg-gradient-to-r from-orange-600 via-orange-600 to-orange-500 text-white">
        <div className="relative container mx-auto px-4 py-10">
          <div className="mb-2 flex items-center gap-3">
            <Sparkles className="size-7 text-yellow-300" />
            <h1 className="text-4xl font-extrabold tracking-tight">My Adventures</h1>
          </div>
          <p className="max-w-md text-lg text-orange-100">Your activity history, all in one place.</p>
          <div className="mt-6 flex items-center gap-6">
            <div className="text-center">
              <p className="text-3xl font-bold">{activitiesByStatus.booked?.length ?? 0}</p>
              <p className="mt-0.5 text-xs uppercase tracking-wider text-orange-200">Booked</p>
            </div>
            <div className="h-10 w-px bg-white/20" />
            <div className="text-center">
              <p className="text-3xl font-bold">{activitiesByStatus.confirmed?.length ?? 0}</p>
              <p className="mt-0.5 text-xs uppercase tracking-wider text-orange-200">Confirmed</p>
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
            <div className="mb-6 flex size-24 items-center justify-center rounded-full bg-gradient-to-br from-orange-100 to-orange-100">
              <PartyPopper className="size-12 text-orange-400" />
            </div>
            <h2 className="mb-2 text-2xl font-bold text-gray-800">No adventures yet!</h2>
            <p className="mb-8 max-w-sm text-gray-500">Join an activity to begin making memories.</p>
            <Button onClick={() => navigate('/activities')} className="bg-gradient-to-r from-orange-600 to-orange-500 px-8 text-white hover:from-orange-700 hover:to-orange-600">
              <Sparkles className="mr-2 size-4" /> Browse Activities
            </Button>
          </div>
        ) : (
          <>
            {statusSections.map(status => (
              <section key={status}>
                <div className="mb-5 flex items-center gap-3">
                  <div className="rounded-xl bg-orange-100 p-2">
                    {status === 'booked' ? <Clock className="size-5 text-orange-600" /> : <CheckCircle2 className="size-5 text-orange-600" />}
                  </div>
                  <h2 className="text-2xl font-bold capitalize text-gray-900">{statusLabel(status)} Activities</h2>
                  <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-bold text-gray-500">{activitiesByStatus[status].length}</span>
                </div>
                <div className="grid gap-6">{activitiesByStatus[status].map(activity => <ActivityHistoryCard key={activity.key} activity={activity} cancelling={cancellingIds.has(activity.orderId || activity.bookingOrderId || activity.id)} onCancel={paid => cancelBooking(activity, paid)} onPay={() => navigate(`/payment/${activity.id}`, { state: { booking: activity } })} />)}</div>
              </section>
            ))}
          </>
        )}
      </main>
    </div>
  );
}
