import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { Header } from '../components/Header';
import { Input } from '../components/ui/input';
import { Calendar, MapPin, Users, Lock, CreditCard, CheckCircle, ChevronLeft } from 'lucide-react';
import { format } from 'date-fns';
import { apiService } from '../../services/api';

type PayMethod = 'card' | 'momo';

function formatCardNumber(v: string) {
  return v.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();
}
function formatExpiry(v: string) {
  const digits = v.replace(/\D/g, '').slice(0, 4);
  return digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits;
}

export default function Payment() {
  const { groupId } = useParams<{ groupId: string }>();
  const navigate = useNavigate();
  const { groups, activities, updateGroupStatus } = useApp();
  const { user } = useAuth();

  const group = useMemo(() => groups.find(g => g.id === groupId), [groups, groupId]);
  const activity = useMemo(
    () => group ? activities.find(a => a.id === group.activityId) : undefined,
    [group, activities]
  );

  const [method, setMethod] = useState<PayMethod>('card');
  const [card, setCard] = useState({ holder: '', number: '', expiry: '', cvv: '' });
  const [momoPhone, setMomoPhone] = useState('');
  const [processing, setProcessing] = useState(false);
  const [done, setDone] = useState(false);
  const [paymentError, setPaymentError] = useState('');

  if (!group || !activity) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-16 text-center text-gray-500">
          Booking not found.
        </div>
      </div>
    );
  }

  const price = group.totalPrice ?? activity.price;

  const cardReady = card.holder && card.number && card.expiry && card.cvv;
  const momoReady = momoPhone.replace(/\D/g, '').length >= 9;
  const canPay = method === 'card' ? cardReady : momoReady;

  const handlePay = async () => {
    setPaymentError('');
    setProcessing(true);
    try {
      await apiService.sendPaymentCallback({
        transactionId: crypto.randomUUID(),
        amount: Number(price),
        createdAt: new Date().toISOString(),
        status: 'success',
      });
      updateGroupStatus(group.id, 'confirmed');
      setDone(true);
    } catch (error) {
      setPaymentError(error instanceof Error ? error.message : 'Payment could not be confirmed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  // ── Success screen ────────────────────────────────────────────────────────
  if (done) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-50 via-white to-gray-50">
        <Header />
        <div className="flex flex-col items-center justify-center py-24 px-4 text-center">
          <div className="size-24 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center shadow-lg mb-6">
            <CheckCircle className="size-12 text-white" />
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Payment Confirmed!</h1>
          <p className="text-gray-500 mb-8 max-w-sm">
            You're all set for <span className="font-semibold text-gray-800">{activity.name}</span>. See you there!
          </p>
          <button
            onClick={() => navigate('/my-groups')}
            className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-500 text-white font-bold px-8 py-3 rounded-full shadow-lg hover:opacity-90 transition-opacity"
          >
            View My Groups
          </button>
        </div>
      </div>
    );
  }

  // ── Payment screen ────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 via-white to-gray-50">
      <Header />

      <div className="container mx-auto px-4 py-8 max-w-lg">
        <button
          onClick={() => navigate('/my-groups')}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-6 transition-colors"
        >
          <ChevronLeft className="size-4" /> Back to My Groups
        </button>

        <h1 className="text-2xl font-extrabold text-gray-900 mb-1">Complete Payment</h1>
        <p className="text-sm text-gray-400 mb-6">Secure your spot by paying below</p>

        {/* Activity summary */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-5">
          <div className="flex items-center gap-4 p-5 border-b border-gray-50">
            <img
              src={activity.image}
              alt={activity.name}
              className="size-16 rounded-xl object-cover shrink-0"
            />
            <div className="flex-1 min-w-0">
              <p className="font-extrabold text-gray-900 truncate">{activity.name}</p>
              <p className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                <Calendar className="size-3" />
                {format(new Date(group.activityDate), 'EEEE, MMM d, yyyy')}
              </p>
              <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                <MapPin className="size-3" />
                {group.meetingPoint.address}
              </p>
            </div>
          </div>

          {/* Group members */}
          <div className="px-5 py-4 border-b border-gray-50">
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Users className="size-3" /> Your Group ({group.members.length} people)
            </p>
            <div className="flex flex-wrap gap-2">
              {group.members.map((m, i) => (
                <div key={m.userId} className="flex items-center gap-1.5 bg-gray-50 rounded-full px-3 py-1.5">
                  <div
                    className={`size-4 rounded-full shrink-0 ${
                      m.userId === user?.id
                        ? 'bg-gradient-to-br from-orange-400 to-pink-500'
                        : ['bg-gradient-to-br from-purple-400 to-indigo-500',
                           'bg-gradient-to-br from-blue-400 to-cyan-400',
                           'bg-gradient-to-br from-green-400 to-teal-400',
                          ][i % 3]
                    }`}
                  />
                  <span className="text-xs font-semibold text-gray-700">
                    {m.name}{m.userId === user?.id ? ' (you)' : ''}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Price breakdown */}
          <div className="px-5 py-4">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-500">Your spot</span>
              <span className="font-semibold text-gray-800">${price}</span>
            </div>
            <div className="border-t border-gray-100 pt-3 flex justify-between font-extrabold text-base">
              <span className="text-gray-900">Total</span>
              <span className="text-pink-500">${price}</span>
            </div>
          </div>
        </div>

        {/* Payment method toggle */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-5 space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs font-extrabold text-gray-400 uppercase tracking-widest">Payment Method</p>
            <div className="flex items-center gap-1 text-xs text-gray-400">
              <Lock className="size-3" /> Secure checkout
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setMethod('card')}
              className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                method === 'card'
                  ? 'border-purple-500 bg-purple-50 text-purple-700'
                  : 'border-gray-100 bg-gray-50 text-gray-500 hover:border-gray-200'
              }`}
            >
              <CreditCard className="size-6" />
              <span className="text-sm font-bold">Card</span>
            </button>
            <button
              onClick={() => setMethod('momo')}
              className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                method === 'momo'
                  ? 'border-pink-500 bg-pink-50 text-pink-700'
                  : 'border-gray-100 bg-gray-50 text-gray-500 hover:border-gray-200'
              }`}
            >
              {/* MoMo icon — simple phone + M */}
              <div className="size-6 rounded-full bg-[#FFCC00] flex items-center justify-center">
                <span className="text-[10px] font-black text-[#C8102E] leading-none">M</span>
              </div>
              <span className="text-sm font-bold">MoMo</span>
            </button>
          </div>

          {/* Card fields */}
          {method === 'card' && (
            <div className="space-y-3 pt-1">
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
            </div>
          )}

          {/* MoMo fields */}
          {method === 'momo' && (
            <div className="space-y-3 pt-1">
              <div>
                <label className="text-xs font-semibold text-gray-500">MoMo Phone Number</label>
                <Input
                  value={momoPhone}
                  onChange={e => setMomoPhone(e.target.value.replace(/[^\d\s+()-]/g, '').slice(0, 15))}
                  placeholder="024 000 0000"
                  className="mt-1"
                  type="tel"
                />
                <p className="text-xs text-gray-400 mt-1">
                  A payment prompt will be sent to this number
                </p>
              </div>
            </div>
          )}

          <p className="text-xs text-gray-300 text-center">Your payment is securely confirmed before your booking is updated.</p>
        </div>

        {paymentError && (
          <p role="alert" className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-center text-sm font-medium text-red-600">
            {paymentError}
          </p>
        )}

        {/* Pay button */}
        <button
          onClick={handlePay}
          disabled={processing || !canPay}
          className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 transition-opacity shadow-md"
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
            <><Lock className="size-4" /> Pay ${price}</>
          )}
        </button>
      </div>
    </div>
  );
}
