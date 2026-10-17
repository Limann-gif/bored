import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { Sidebar } from '../components/Sidebar';
import { adventureFilters, getAdventureStatus, isGroupBooking } from './adventureStatus';
import './MyAdventures.css';
import { Button } from '../components/ui/button';
import {
  Calendar,
  ArrowUpRight,
  Search,
  Compass,
  CheckCircle2,
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
  refunded: 'bg-violet-100 text-violet-700',
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
  const status = getAdventureStatus(activity);
  const refundPending = [activity.confirmationStatus, activity.status, activity.historyStatus].some(value => ['requestrefund', 'refundrequested'].includes(value?.toLowerCase().replace(/[\s_-]/g, '')));
  const showMemberNames = activity.confirmationStatus?.trim().toLowerCase() === 'confirmed';
  const isBooked = status === 'booked';
  const isPaid = status === 'confirmed';
  const canCancel = !['cancelled', 'canceled', 'completed', 'requestrefund', 'refunded'].includes(status) && (isBooked || isPaid);
  const eventDate = new Date(activity.activityDate);
  const image = activity.imageUrl;
  const description = activity.description;
  const location = activity.location;

  return (
    <article className="adventure-card overflow-hidden rounded-2xl border-0 bg-white shadow-md transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl">
      <div className="adventure-card-layout">
        {image ? (
          <img src={image} alt={activity.name} className="adventure-card-image" />
        ) : (
          <div className="adventure-card-image flex items-center justify-center bg-orange-100 text-orange-400"><Compass size={42} /></div>
        )}

        <div className="p-6">
          <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
            <div>
              <h2 className="text-2xl font-extrabold text-gray-900">{activity.name}</h2>
              {description && <p className="mt-2 text-sm leading-relaxed text-gray-500">{description}</p>}
            </div>
            <div className="flex flex-wrap sm:flex-col items-start sm:items-end gap-2">
              <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold capitalize ${statusStyles[status] ?? 'bg-gray-100 text-gray-600'}`}>
                {refundPending ? 'Refund requested' : statusLabel(status)}
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
            <div className="mt-5 flex flex-col sm:flex-row items-start sm:items-center gap-3 justify-between rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3">
              <div><p className="text-sm font-bold text-amber-700">Payment pending</p><p className="mt-0.5 text-xs text-amber-500">Please complete your payment to confirm your booking.</p></div>
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
  const [activeFilter, setActiveFilter] = useState('booked');
  const [search, setSearch] = useState('');

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
            key: booking.orderId || booking.bookingOrderId || booking.id,
          }))
        ).filter(activity => getAdventureStatus(activity) !== 'cancelled'));
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
      setOrders(current => current.filter(order => order.key !== activity.key));
      toast.success(message);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not cancel booking');
    } finally {
      setCancellingIds(ids => { const next = new Set(ids); next.delete(bookingId); return next; });
    }
  };

  const activitiesByStatus = useMemo(() => orders.reduce<Record<string, HistoryActivity[]>>((groups, activity) => {
    groups[getAdventureStatus(activity)].push(activity);
    if (isGroupBooking(activity)) groups['group-booking'].push(activity);
    return groups;
  }, { completed: [], confirmed: [], booked: [], refunded: [], 'group-booking': [] }), [orders]);
  const selectedFilter = adventureFilters.find(filter => filter.id === activeFilter)!;
  const visibleActivities = activitiesByStatus[activeFilter].filter(activity =>
    `${activity.name} ${activity.location}`.toLowerCase().includes(search.trim().toLowerCase()));
  const upcoming = orders.filter(activity => ['booked', 'confirmed'].includes(getAdventureStatus(activity)))
    .filter(activity => !Number.isNaN(new Date(activity.activityDate).getTime()))
    .sort((a, b) => new Date(a.activityDate).getTime() - new Date(b.activityDate).getTime())[0];

  return (
    <div className="adventures-shell">
      <Sidebar />
      <div className="adventures-workspace">
        <main className="adventures-main">
          <div className="adventures-title-row"><div><h1>My Adventures</h1><p>Good times, all in one place.</p></div><label className="adventures-search"><Search size={17} /><input aria-label="Search your adventures" placeholder="Search adventures…" value={search} onChange={event => setSearch(event.target.value)} /></label></div>
          <div className="adventures-filters" role="group" aria-label="Filter adventures">
            {adventureFilters.map(filter => <button key={filter.id} aria-pressed={activeFilter === filter.id} className={activeFilter === filter.id ? 'active' : ''} onClick={() => setActiveFilter(filter.id)}>{filter.label}<span>{loading ? '–' : activitiesByStatus[filter.id].length}</span></button>)}
          </div>
          <p className="adventures-filter-description">{selectedFilter.description}</p>
          {loading ? <div className="adventures-empty" role="status">Loading your adventures…</div>
            : error ? <div role="alert" className="adventures-empty text-red-600">{error}</div>
            : visibleActivities.length === 0 ? <div className="adventures-empty"><span className="adventures-empty-icon"><PartyPopper size={32} /></span><h3>{search ? 'No matching adventures' : activeFilter === 'group-booking' ? 'No group bookings yet' : `No ${selectedFilter.label.toLowerCase()} adventures yet`}</h3><p>{search ? 'Try a different activity or location.' : 'Find something you love and make a plan worth looking forward to.'}</p><Button onClick={() => navigate('/activities')} className="bg-orange-500 text-white hover:bg-orange-600">Explore activities <ArrowUpRight size={16} /></Button></div>
            : <div className="adventures-grid">{visibleActivities.map(activity => <ActivityHistoryCard key={activity.key} activity={activity} cancelling={cancellingIds.has(activity.orderId || activity.bookingOrderId || activity.id)} onCancel={paid => cancelBooking(activity, paid)} onPay={() => navigate(`/payment/${activity.id}`, { state: { booking: activity } })} />)}</div>}
        </main>
        <aside className="adventures-rail" aria-label="Adventure overview">
          <div className="adventures-profile"><span>{user?.name?.charAt(0) || 'A'}</span><div><strong>{user?.name || 'Adventurer'}</strong><p>Make room for adventure</p></div></div>
          <section className="adventures-summary"><p className="adventures-eyebrow">YOUR STORY SO FAR</p><h2>A little adventure.<br />A lot of memories.</h2><div className="adventures-total">{loading ? '–' : orders.length}<span>total adventures</span></div><div className="adventures-summary-counts"><div><CheckCircle2 size={18} /><strong>{loading ? '–' : activitiesByStatus.completed.length}</strong><span>Completed</span></div><div><Users size={18} /><strong>{loading ? '–' : activitiesByStatus.confirmed.length}</strong><span>Confirmed</span></div></div></section>
          <section className="adventures-next"><div className="adventures-rail-title"><h2>Next on your calendar</h2><Calendar size={18} /></div>{!loading && !error && upcoming ? <><p className="adventures-next-date">{format(new Date(upcoming.activityDate), 'MMM d, yyyy')}</p><h3>{upcoming.name}</h3><p><MapPin size={14} />{upcoming.location || 'Location to be confirmed'}</p><span className="adventures-next-status">{statusLabel(getAdventureStatus(upcoming))}</span></> : <p>{loading ? 'Loading your calendar…' : error ? 'Your calendar is currently unavailable.' : 'Your calendar is open for something wonderful.'}</p>}</section>
          <section className="adventures-discover"><Sparkles size={26} /><h2>Try something new.</h2><p>A new place. A new experience. A story to tell.</p><button onClick={() => navigate('/activities')}>Find your next adventure <ArrowUpRight size={16} /></button></section>
        </aside>
      </div>
    </div>
  );
}
