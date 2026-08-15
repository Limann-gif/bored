import { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate, Navigate } from 'react-router';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { Header } from '../components/Header';
import { Calendar, MapPin, Lock, CreditCard, ChevronLeft, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';
import { apiService, type PaymentOrderRecord } from '../../services/api';

const DEFAULT_PAYMENT_ORDER_ID = '3efd04c1-e3bd-46c5-ac42-6b060edbda81';
const EMPTY_ACTIVITY_ID = '00000000-0000-0000-0000-000000000000';

export default function Payment() {
  const { groupId: orderId } = useParams<{ groupId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { groups, activities } = useApp();

  const group = useMemo(() => groups.find(g => g.id === orderId), [groups, orderId]);
  const activity = useMemo(
    () => group ? activities.find(a => a.id === group.activityId) : undefined,
    [group, activities]
  );

  const [processing, setProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState('');
  const [paymentOrder, setPaymentOrder] = useState<PaymentOrderRecord | null>(null);
  const [orderLoading, setOrderLoading] = useState(true);
  const [orderError, setOrderError] = useState('');

  useEffect(() => {
    if (orderId === EMPTY_ACTIVITY_ID) {
      navigate(`/payment/${DEFAULT_PAYMENT_ORDER_ID}`, { replace: true });
      return;
    }
    if (!orderId) {
      setOrderError('Payment order not found');
      setOrderLoading(false);
      return;
    }

    apiService.getPaymentOrder(orderId)
      .then(setPaymentOrder)
      .catch((error: Error) => setOrderError(error.message))
      .finally(() => setOrderLoading(false));
  }, [orderId]);

  if (orderLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-16 text-center text-gray-500">
          Loading payment details…
        </div>
      </div>
    );
  }

  // A confirmed booking must never re-enter checkout, including via browser Back.
  if (group?.status === 'confirmed') {
    return <Navigate to="/my-groups" replace />;
  }

  const activityName = paymentOrder?.activityName ?? activity?.name ?? 'Activity booking';
  const activityImage = paymentOrder?.imageUrl ?? activity?.image;
  const activityDate = paymentOrder?.activityDate ?? group?.activityDate ?? activity?.activityDate;
  const activityLocation = paymentOrder?.location ?? group?.meetingPoint.address ?? activity?.location ?? 'Location to be confirmed';
  const price = paymentOrder?.amount ?? group?.totalPrice ?? activity?.price ?? 0;

  const activityId = paymentOrder?.activityId ?? group?.activityId ?? activity?.id;
  const canPay = Boolean(user?.id && activityId && orderId);

  const handlePay = async () => {
    setPaymentError('');
    setProcessing(true);
    try {
      if (!user?.id || !activityId || !orderId) {
        throw new Error('We could not find all the booking details needed to start payment.');
      }
      const authorizationUrl = await apiService.initializePayment({
        userId: user.id,
        activityId,
        orderId,
      });
      window.location.assign(authorizationUrl);
    } catch (error) {
      setPaymentError(error instanceof Error ? error.message : 'Payment could not be confirmed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

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

        {orderError && (
          <p role="alert" className="mb-5 rounded-xl bg-amber-50 px-4 py-3 text-center text-sm font-medium text-amber-700">
            {orderError}. Showing the available booking details instead.
          </p>
        )}

        {/* Activity summary */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-5">
          <div className="flex items-center gap-4 p-5 border-b border-gray-50">
            {activityImage ? (
              <img src={activityImage} alt={activityName} className="size-16 rounded-xl object-cover shrink-0" />
            ) : (
              <div className="size-16 rounded-xl shrink-0 bg-gradient-to-br from-purple-500 to-pink-500" />
            )}
            <div className="flex-1 min-w-0">
              <p className="font-extrabold text-gray-900 truncate">{activityName}</p>
              {activityDate && <p className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                <Calendar className="size-3" /> {format(new Date(activityDate), 'EEEE, MMM d, yyyy')}
              </p>}
              <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                <MapPin className="size-3" />
                {activityLocation}
              </p>
            </div>
          </div>

          {/* Price breakdown */}
          <div className="px-5 py-4">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-500">Your spot</span>
              <span className="font-semibold text-gray-800">GH₵{price}</span>
            </div>
            <div className="border-t border-gray-100 pt-3 flex justify-between font-extrabold text-base">
              <span className="text-gray-900">Total</span>
              <span className="text-pink-500">GH₵{price}</span>
            </div>
          </div>
        </div>

        {/* Paystack redirect */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-5 space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs font-extrabold text-gray-400 uppercase tracking-widest">Payment Method</p>
            <div className="flex items-center gap-1 text-xs text-gray-400">
              <Lock className="size-3" /> Secure checkout
            </div>
          </div>

          <div className="flex items-center gap-4 rounded-xl border border-purple-100 bg-purple-50 p-4">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-white text-purple-600 shadow-sm">
              <CreditCard className="size-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900">Pay securely with Paystack</p>
              <p className="mt-0.5 text-xs text-gray-500">You’ll be redirected to Paystack to choose your payment method.</p>
            </div>
          </div>
          <p className="text-xs text-gray-400 text-center">Your booking will be updated after Paystack confirms the payment.</p>
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
            <><Lock className="size-4" /> Pay GH₵{price} <ExternalLink className="size-3.5" /></>
          )}
        </button>
      </div>
    </div>
  );
}
