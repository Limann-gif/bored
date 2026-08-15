import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { CheckCircle, LoaderCircle, XCircle } from 'lucide-react';
import { Header } from '../components/Header';
import { apiService } from '../../services/api';

type VerificationState = 'verifying' | 'success' | 'error';

export default function PaymentCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const reference = searchParams.get('reference') ?? searchParams.get('trxref');
  const verificationStarted = useRef(false);
  const [state, setState] = useState<VerificationState>('verifying');
  const [error, setError] = useState('');

  useEffect(() => {
    if (verificationStarted.current) return;
    verificationStarted.current = true;

    if (!reference) {
      setError('The payment reference is missing from the callback URL.');
      setState('error');
      return;
    }

    apiService.verifyPayment(reference)
      .then(() => setState('success'))
      .catch((verificationError: unknown) => {
        setError(verificationError instanceof Error
          ? verificationError.message
          : 'Payment verification failed. Please try again.');
        setState('error');
      });
  }, [reference]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 via-white to-gray-50">
      <Header />
      <main className="mx-auto flex max-w-lg flex-col items-center px-4 py-24 text-center">
        {state === 'verifying' && (
          <>
            <div className="mb-6 flex size-24 items-center justify-center rounded-full bg-purple-100">
              <LoaderCircle className="size-12 animate-spin text-purple-600" />
            </div>
            <h1 className="mb-2 text-2xl font-extrabold text-gray-900">Verifying your payment</h1>
            <p className="text-gray-500">Please wait while we confirm your payment with Paystack…</p>
          </>
        )}

        {state === 'success' && (
          <>
            <div className="mb-6 flex size-24 items-center justify-center rounded-full bg-gradient-to-br from-green-400 to-emerald-500 shadow-lg">
              <CheckCircle className="size-12 text-white" />
            </div>
            <h1 className="mb-2 text-3xl font-extrabold text-gray-900">Payment confirmed!</h1>
            <p className="mb-8 text-gray-500">Your payment was successful and your booking has been updated.</p>
            <button
              onClick={() => navigate('/my-groups', { replace: true })}
              className="rounded-full bg-gradient-to-r from-purple-600 to-pink-500 px-8 py-3 font-bold text-white shadow-lg transition-opacity hover:opacity-90"
            >
              View My Groups
            </button>
          </>
        )}

        {state === 'error' && (
          <>
            <div className="mb-6 flex size-24 items-center justify-center rounded-full bg-red-100">
              <XCircle className="size-12 text-red-500" />
            </div>
            <h1 className="mb-2 text-2xl font-extrabold text-gray-900">We couldn’t verify your payment</h1>
            <p role="alert" className="mb-8 text-gray-500">{error}</p>
            <div className="flex flex-wrap justify-center gap-3">
              <button
                onClick={() => window.location.reload()}
                className="rounded-full bg-gradient-to-r from-purple-600 to-pink-500 px-7 py-3 font-bold text-white shadow-md transition-opacity hover:opacity-90"
              >
                Try Again
              </button>
              <button
                onClick={() => navigate('/my-groups', { replace: true })}
                className="rounded-full border border-gray-200 bg-white px-7 py-3 font-bold text-gray-700 hover:bg-gray-50"
              >
                View My Groups
              </button>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
