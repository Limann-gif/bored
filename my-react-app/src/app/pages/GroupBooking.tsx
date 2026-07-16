import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { apiService } from '../../services/api';
import { Sidebar } from '../components/Sidebar';
import { Input } from '../components/ui/input';
import {
  ArrowLeft, ArrowRight, Users, Mail, Gift, CheckCircle,
  X, Plus, MapPin, Calendar, CreditCard, Lock, Sparkles,
} from 'lucide-react';
import { format } from 'date-fns';

type Friend = { id: string; name: string; email: string };

const STEP_LABELS = ['Add Friends', 'Booking Style', 'Payment', 'Confirmed'];

// ── Stepper ──────────────────────────────────────────────────────────────────
function Stepper({ step }: { step: number }) {
  return (
    <div className="flex items-center gap-0 mb-8">
      {STEP_LABELS.map((label, i) => {
        const n = i + 1;
        const done = n < step;
        const active = n === step;
        return (
          <div key={n} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={`size-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  done    ? 'bg-green-500 text-white' :
                  active  ? 'bg-gradient-to-br from-pink-500 to-purple-600 text-white shadow-md' :
                            'bg-gray-100 text-gray-400'
                }`}
              >
                {done ? <CheckCircle className="size-4" /> : n}
              </div>
              <span className={`text-[10px] font-semibold whitespace-nowrap ${active ? 'text-gray-800' : 'text-gray-400'}`}>
                {label}
              </span>
            </div>
            {i < STEP_LABELS.length - 1 && (
              <div className={`flex-1 h-0.5 mx-2 mb-5 ${done ? 'bg-green-400' : 'bg-gray-200'}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function GroupBooking() {
  const { activityId } = useParams<{ activityId: string }>();
  const { state } = useLocation() as { state?: { groupSize?: number } };
  const navigate = useNavigate();
  const { user } = useAuth();
  const { activities, addGroupBooking, addGroup } = useApp();

  const activity = activities.find(a => a.id === activityId);

  const progressKey = activityId ? `boredGroupBookingProgress-${activityId}` : null;

  const savedProgress = progressKey ? (() => {
    try { return JSON.parse(localStorage.getItem(progressKey) ?? 'null'); } catch { return null; }
  })() : null;

  const [step, setStep] = useState<number>(savedProgress?.step ?? 1);
  const [friends, setFriends] = useState<Friend[]>(savedProgress?.friends ?? []);
  const [friendName, setFriendName] = useState('');
  const [friendEmail, setFriendEmail] = useState('');
  const [friendError, setFriendError] = useState('');
  const [bookingType, setBookingType] = useState<'invite' | 'surprise' | null>(savedProgress?.bookingType ?? null);
  const [card, setCard] = useState({ holder: '', number: '', expiry: '', cvv: '' });
  const [processing, setProcessing] = useState(false);

  const saveProgress = (updates: { step?: number; friends?: Friend[]; bookingType?: 'invite' | 'surprise' | null }) => {
    if (!progressKey) return;
    const current = (() => {
      try { return JSON.parse(localStorage.getItem(progressKey) ?? 'null') ?? {}; } catch { return {}; }
    })();
    localStorage.setItem(progressKey, JSON.stringify({ ...current, ...updates }));
  };

  const clearProgress = () => {
    if (progressKey) localStorage.removeItem(progressKey);
  };

  const totalPeople = friends.length + 1;
  const pricePerPerson = activity?.price ?? 0;
  const totalPrice = bookingType === 'surprise' ? pricePerPerson * totalPeople : pricePerPerson;

  const addFriend = () => {
    setFriendError('');
    if (!friendName.trim()) { setFriendError('Name is required.'); return; }
    if (!friendEmail.trim() || !/\S+@\S+\.\S+/.test(friendEmail)) { setFriendError('Valid email required.'); return; }
    if (friends.some(f => f.email.toLowerCase() === friendEmail.toLowerCase())) { setFriendError('This email is already added.'); return; }
    if (user?.email.toLowerCase() === friendEmail.toLowerCase()) { setFriendError("That's your own email!"); return; }
    setFriends(prev => [...prev, { id: `f-${Date.now()}`, name: friendName.trim(), email: friendEmail.trim() }]);
    setFriendName('');
    setFriendEmail('');
  };

  const removeFriend = (id: string) => setFriends(prev => prev.filter(f => f.id !== id));

  const formatCardNumber = (v: string) =>
    v.replace(/\D/g, '').slice(0, 16).replace(/(.{4})(?=.)/g, '$1 ');

  const formatExpiry = (v: string) => {
    const d = v.replace(/\D/g, '').slice(0, 4);
    return d.length >= 3 ? d.slice(0, 2) + '/' + d.slice(2) : d;
  };

  const handleAddFriendsContinue = async () => {
    if (friends.length === 0 || !activityId) return;
    setProcessing(true);
    try {
      await apiService.bookActivity(activityId, {
        participantsName: friends.map(f => f.name),
        participantsEmail: friends.map(f => f.email),
      });
      saveProgress({ friends, step: 2, bookingType: null });
      setStep(2);
    } catch (err) {
      console.error('Booking failed:', err);
    } finally {
      setProcessing(false);
    }
  };

  const handlePay = () => {
    if (!card.holder || !card.number || !card.expiry || !card.cvv || !activityId || !bookingType) return;
    setProcessing(true);
    setTimeout(() => {
      addGroupBooking({
        id: `gb-${Date.now()}`,
        userId: user?.id ?? '',
        creatorEmail: user?.email ?? '',
        activityId,
        bookingType,
        friends: friends.map(f => ({ name: f.name, email: f.email })),
        totalPrice,
        bookedAt: new Date().toISOString(),
      });
      clearProgress();
      setProcessing(false);
      setStep(4);
    }, 1800);
  };

  if (!activity) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-500 mb-3">Activity not found.</p>
            <button onClick={() => navigate('/activities')} className="text-pink-500 font-semibold hover:underline text-sm">
              Back to Activities
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />

      <main className="flex-1 overflow-auto min-w-0">
        {/* Header */}
        <div className="bg-white border-b border-gray-100 px-8 py-5 flex items-center gap-4 sticky top-0 z-40">
          <button
            onClick={() => {
              if (step > 1 && step < 4) {
                const prev = step - 1;
                saveProgress({ step: prev });
                setStep(prev);
              } else {
                navigate('/activities');
              }
            }}
            className="size-9 rounded-xl border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft className="size-4" />
          </button>
          <div>
            <h1 className="text-xl font-extrabold text-gray-900">Group Booking</h1>
            <p className="text-sm text-gray-400 mt-0.5">{activity.name}</p>
          </div>
        </div>

        <div className="px-8 py-8 max-w-2xl">
          <Stepper step={step} />

          {/* ── Step 1: Add Friends ───────────────────────────────────── */}
          {step === 1 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-xl font-extrabold text-gray-900">Who's coming?</h2>
                <p className="text-sm text-gray-400 mt-1">Add your friends by name and email. You can invite them to pay their own share or book as a surprise.</p>
              </div>

              {/* Activity summary strip */}
              <div className="flex items-center gap-3 bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                <img src={activity.image} alt={activity.name} className="size-12 rounded-xl object-cover shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-extrabold text-gray-900 truncate">{activity.name}</p>
                  <p className="text-xs text-gray-400 flex items-center gap-1.5 mt-0.5">
                    <Calendar className="size-3" />
                    {format(new Date(activity.date), 'EEE, MMM d')}
                    <span className="text-gray-200">·</span>
                    <MapPin className="size-3" />
                    {activity.location}
                  </p>
                </div>
                <span className="text-sm font-bold text-pink-500 shrink-0">${activity.price}/pp</span>
              </div>

              {/* Current group */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3">
                <p className="text-xs font-extrabold text-gray-400 uppercase tracking-widest">Your Group ({totalPeople})</p>

                {/* You */}
                <div className="flex items-center gap-3 py-2">
                  <div className="size-9 rounded-full bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center text-white text-sm font-bold shrink-0">
                    {user?.name.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-800">{user?.name}</p>
                    <p className="text-xs text-gray-400">{user?.email}</p>
                  </div>
                  <span className="text-[10px] font-extrabold bg-pink-100 text-pink-500 px-2 py-0.5 rounded-full">You</span>
                </div>

                {/* Friends */}
                {friends.map(f => (
                  <div key={f.id} className="flex items-center gap-3 py-2 border-t border-gray-50">
                    <div className="size-9 rounded-full bg-gradient-to-br from-purple-400 to-indigo-500 flex items-center justify-center text-white text-sm font-bold shrink-0">
                      {f.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800">{f.name}</p>
                      <p className="text-xs text-gray-400 truncate">{f.email}</p>
                    </div>
                    <button onClick={() => removeFriend(f.id)} className="size-6 rounded-full bg-red-50 flex items-center justify-center text-red-400 hover:bg-red-100 transition-colors">
                      <X className="size-3" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Add friend form */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3">
                <p className="text-xs font-extrabold text-gray-400 uppercase tracking-widest">Add a Friend</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-gray-500 font-semibold">Name</label>
                    <Input
                      value={friendName}
                      onChange={e => setFriendName(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && addFriend()}
                      placeholder="e.g. Jordan"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 font-semibold">Email</label>
                    <Input
                      type="email"
                      value={friendEmail}
                      onChange={e => setFriendEmail(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && addFriend()}
                      placeholder="jordan@email.com"
                      className="mt-1"
                    />
                  </div>
                </div>
                {friendError && <p className="text-xs text-red-500">{friendError}</p>}
                <button
                  onClick={addFriend}
                  className="flex items-center gap-2 text-sm font-bold text-purple-600 hover:text-purple-700 transition-colors"
                >
                  <Plus className="size-4" /> Add to group
                </button>
              </div>

              <button
                onClick={handleAddFriendsContinue}
                disabled={friends.length === 0 || processing}
                className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 transition-opacity shadow-sm"
              >
                {processing ? (
                  <>
                    <svg className="animate-spin size-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    Booking…
                  </>
                ) : (
                  <>Continue with {totalPeople} people <ArrowRight className="size-4" /></>
                )}
              </button>
            </div>
          )}

          {/* ── Step 2: Booking Style ─────────────────────────────────── */}
          {step === 2 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-xl font-extrabold text-gray-900">How should we do this?</h2>
                <p className="text-sm text-gray-400 mt-1">Choose how you'd like to book for your group of {totalPeople}.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Invite */}
                <button
                  onClick={() => setBookingType('invite')}
                  className={`text-left p-6 rounded-2xl border-2 transition-all ${
                    bookingType === 'invite'
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <div className={`size-12 rounded-2xl flex items-center justify-center mb-4 ${bookingType === 'invite' ? 'bg-purple-500' : 'bg-gray-100'}`}>
                    <Mail className={`size-6 ${bookingType === 'invite' ? 'text-white' : 'text-gray-400'}`} />
                  </div>
                  <h3 className="text-base font-extrabold text-gray-900 mb-1">Invite Friends</h3>
                  <p className="text-xs text-gray-500 leading-relaxed mb-4">
                    We'll send each friend a personalized link. They confirm their spot and pay their own share.
                  </p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-xl font-extrabold text-purple-600">${pricePerPerson}</span>
                    <span className="text-xs text-gray-400">you pay (your share only)</span>
                  </div>
                  {bookingType === 'invite' && (
                    <div className="mt-3 flex items-center gap-1.5 text-xs text-purple-600 font-bold">
                      <CheckCircle className="size-3.5" /> Selected
                    </div>
                  )}
                </button>

                {/* Surprise */}
                <button
                  onClick={() => setBookingType('surprise')}
                  className={`text-left p-6 rounded-2xl border-2 transition-all ${
                    bookingType === 'surprise'
                      ? 'border-pink-500 bg-pink-50'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <div className={`size-12 rounded-2xl flex items-center justify-center mb-4 ${bookingType === 'surprise' ? 'bg-gradient-to-br from-pink-500 to-purple-600' : 'bg-gray-100'}`}>
                    <Gift className={`size-6 ${bookingType === 'surprise' ? 'text-white' : 'text-gray-400'}`} />
                  </div>
                  <h3 className="text-base font-extrabold text-gray-900 mb-1">Surprise Booking</h3>
                  <p className="text-xs text-gray-500 leading-relaxed mb-4">
                    You cover everyone's spot. Friends just show up — perfect for birthdays or special occasions.
                  </p>
                  <div className="flex items-baseline gap-1 flex-wrap">
                    <span className="text-xl font-extrabold text-pink-500">${pricePerPerson * totalPeople}</span>
                    <span className="text-xs text-gray-400">${pricePerPerson} × {totalPeople} people</span>
                  </div>
                  {bookingType === 'surprise' && (
                    <div className="mt-3 flex items-center gap-1.5 text-xs text-pink-500 font-bold">
                      <CheckCircle className="size-3.5" /> Selected
                    </div>
                  )}
                </button>
              </div>

              <button
                onClick={() => {
                  if (!bookingType || !activityId || !user || !activity) return;
                  const newGroupId = `group-gb-${Date.now()}`;
                  const totalPeopleCount = friends.length + 1;
                  const price = bookingType === 'surprise'
                    ? activity.price * totalPeopleCount
                    : activity.price;
                  addGroup({
                    id: newGroupId,
                    activityId,
                    members: [
                      {
                        userId: user.id,
                        name: user.name,
                        location: user.location ?? { lat: 0, lng: 0, address: activity.location },
                        joinedAt: new Date(),
                      },
                      ...friends.map(f => ({
                        userId: `friend-${f.email.replace(/[^a-z0-9]/gi, '')}`,
                        name: f.name,
                        location: { lat: 0, lng: 0, address: '' },
                        joinedAt: new Date(),
                      })),
                    ],
                    meetingPoint: { lat: 0, lng: 0, address: activity.location },
                    status: 'booked' as const,
                    createdAt: new Date(),
                    activityDate: activity.activityDate,
                    bookingType,
                    totalPrice: price,
                    snapshot: {
                      name: activity.name,
                      image: activity.image,
                      description: activity.description,
                      location: activity.location,
                      price: activity.price,
                    },
                  });
                  clearProgress();
                  navigate('/my-groups');
                }}
                disabled={!bookingType}
                className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 transition-opacity shadow-sm"
              >
                Confirm Booking <ArrowRight className="size-4" />
              </button>
            </div>
          )}

          {/* ── Step 3: Payment ───────────────────────────────────────── */}
          {step === 3 && (
            <div className="space-y-5">
              <div className="flex items-center gap-2 bg-amber-50 border border-amber-100 rounded-xl px-4 py-3 text-xs text-amber-700 font-semibold">
                <CheckCircle className="size-4 shrink-0 text-amber-500" />
                Your booking is saved. You can leave this page and come back to complete payment at any time.
              </div>
              <div>
                <h2 className="text-xl font-extrabold text-gray-900">Review & Pay</h2>
                <p className="text-sm text-gray-400 mt-1">
                  {bookingType === 'invite'
                    ? 'Your friends will each receive an invite to confirm and pay their share.'
                    : 'You are covering everyone. Your friends will be surprised!'}
                </p>
              </div>

              {/* Order summary */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="flex items-center gap-3 p-5 border-b border-gray-50">
                  <img src={activity.image} alt={activity.name} className="size-14 rounded-xl object-cover shrink-0" />
                  <div>
                    <p className="text-sm font-extrabold text-gray-900">{activity.name}</p>
                    <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1.5">
                      <Calendar className="size-3" />
                      {format(new Date(activity.date), 'EEEE, MMMM d, yyyy')}
                    </p>
                    <p className="text-xs text-gray-400 flex items-center gap-1.5 mt-0.5">
                      <MapPin className="size-3" />
                      {activity.location}
                    </p>
                  </div>
                </div>

                <div className="p-5 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">
                      {bookingType === 'invite' ? 'Your spot' : `${totalPeople} spots`}
                    </span>
                    <span className="font-semibold text-gray-800">
                      {bookingType === 'invite' ? `$${pricePerPerson}` : `$${pricePerPerson} × ${totalPeople}`}
                    </span>
                  </div>
                  {bookingType === 'invite' && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">{friends.length} invite{friends.length !== 1 ? 's' : ''} sent</span>
                      <span className="text-gray-400">Friends pay their own</span>
                    </div>
                  )}
                  <div className="border-t border-gray-100 pt-3 flex justify-between font-extrabold text-base">
                    <span className="text-gray-900">Total</span>
                    <span className="text-pink-500">${totalPrice}</span>
                  </div>
                </div>

                {/* Group members */}
                <div className="px-5 pb-5">
                  <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Group</p>
                  <div className="flex flex-wrap gap-2">
                    {[{ name: user?.name ?? 'You', isYou: true }, ...friends.map(f => ({ name: f.name, isYou: false }))].map((m, i) => (
                      <div key={i} className="flex items-center gap-1.5 bg-gray-50 rounded-full px-3 py-1.5">
                        <div className={`size-4 rounded-full ${m.isYou ? 'bg-gradient-to-br from-orange-400 to-pink-500' : 'bg-gradient-to-br from-purple-400 to-indigo-500'}`} />
                        <span className="text-xs font-semibold text-gray-700">{m.name}{m.isYou ? ' (you)' : ''}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Payment form */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-extrabold text-gray-400 uppercase tracking-widest">Payment Details</p>
                  <div className="flex items-center gap-1.5 text-xs text-gray-400">
                    <Lock className="size-3" /> Secure checkout
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-500">Name on Card</label>
                  <Input
                    value={card.holder}
                    onChange={e => setCard(c => ({ ...c, holder: e.target.value }))}
                    placeholder="Alex Chen"
                    className="mt-1"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-500">Card Number</label>
                  <div className="relative mt-1">
                    <CreditCard className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                    <Input
                      value={card.number}
                      onChange={e => setCard(c => ({ ...c, number: formatCardNumber(e.target.value) }))}
                      placeholder="1234 5678 9012 3456"
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-gray-500">Expiry</label>
                    <Input
                      value={card.expiry}
                      onChange={e => setCard(c => ({ ...c, expiry: formatExpiry(e.target.value) }))}
                      placeholder="MM/YY"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500">CVV</label>
                    <Input
                      value={card.cvv}
                      onChange={e => setCard(c => ({ ...c, cvv: e.target.value.replace(/\D/g, '').slice(0, 4) }))}
                      placeholder="123"
                      className="mt-1"
                      type="password"
                    />
                  </div>
                </div>

                <p className="text-xs text-gray-300 text-center">Demo only — no real payment will be processed.</p>
              </div>

              <button
                onClick={handlePay}
                disabled={processing || !card.holder || !card.number || !card.expiry || !card.cvv}
                className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 transition-opacity shadow-sm"
              >
                {processing ? (
                  <>
                    <svg className="animate-spin size-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    Processing…
                  </>
                ) : (
                  <><Lock className="size-4" /> Pay ${totalPrice}</>
                )}
              </button>
            </div>
          )}

          {/* ── Step 4: Confirmed ─────────────────────────────────────── */}
          {step === 4 && (
            <div className="space-y-6 text-center">
              {/* Success icon */}
              <div className="flex flex-col items-center gap-4 py-6">
                <div className="size-20 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center shadow-lg">
                  <CheckCircle className="size-10 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-extrabold text-gray-900">
                    {bookingType === 'invite' ? 'Invites Sent!' : 'All Booked!'}
                  </h2>
                  <p className="text-sm text-gray-400 mt-2 max-w-sm mx-auto leading-relaxed">
                    {bookingType === 'invite'
                      ? `We've sent invite links to ${friends.map(f => f.name).join(', ')}. Once they confirm, your group of ${totalPeople} is set!`
                      : `Your group of ${totalPeople} is booked. Your friends will get a surprise notification — see you at ${activity.name}!`}
                  </p>
                </div>
              </div>

              {/* Booking summary card */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 text-left space-y-4">
                <div className="flex items-center gap-3">
                  <img src={activity.image} alt={activity.name} className="size-14 rounded-xl object-cover shrink-0" />
                  <div>
                    <p className="text-sm font-extrabold text-gray-900">{activity.name}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {format(new Date(activity.date), 'EEE, MMM d')} · {activity.location}
                    </p>
                    <div className="flex items-center gap-1.5 mt-1.5">
                      {bookingType === 'invite' ? (
                        <span className="flex items-center gap-1 text-[10px] font-bold bg-purple-100 text-purple-600 px-2 py-0.5 rounded-full">
                          <Mail className="size-2.5" /> Invites sent
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-[10px] font-bold bg-pink-100 text-pink-500 px-2 py-0.5 rounded-full">
                          <Gift className="size-2.5" /> Surprise booked
                        </span>
                      )}
                      <span className="text-[10px] font-bold bg-green-100 text-green-600 px-2 py-0.5 rounded-full">
                        ${totalPrice} paid
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 pt-1">
                  {[{ name: user?.name ?? 'You', you: true }, ...friends.map(f => ({ name: f.name, you: false }))].map((m, i) => (
                    <div key={i} className="flex items-center gap-1.5 bg-gray-50 rounded-full px-3 py-1.5">
                      <div className={`size-4 rounded-full shrink-0 ${m.you ? 'bg-gradient-to-br from-orange-400 to-pink-500' : 'bg-gradient-to-br from-purple-400 to-indigo-500'}`} />
                      <span className="text-xs font-semibold text-gray-700">{m.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => navigate('/my-groups')}
                  className="flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold text-sm hover:opacity-90 transition-opacity shadow-sm"
                >
                  <Users className="size-4" /> View My Groups
                </button>
                <button
                  onClick={() => navigate('/activities')}
                  className="flex-1 py-4 rounded-2xl border border-gray-200 bg-white text-gray-700 font-bold text-sm hover:bg-gray-50 transition-colors"
                >
                  <Sparkles className="size-4 inline mr-1.5" /> More Activities
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
