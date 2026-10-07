import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import { Sidebar } from '../components/Sidebar';
import { useApp } from '../context/AppContext';
import { apiService, type RefundRequestRecord } from '../../services/api';

export default function AdminRefunds() {
  const navigate = useNavigate();
  const { activities } = useApp();
  const [requests, setRequests] = useState<RefundRequestRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refresh, setRefresh] = useState(0);
  useEffect(() => {
    let active = true;
    setLoading(true); setError('');
    apiService.getRefundRequests()
      .then(data => { if (active) setRequests(data); })
      .catch(err => { if (active) setError(err instanceof Error ? err.message : 'Could not load refund requests'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [refresh]);
  return <div className="flex min-h-screen bg-gray-50"><Sidebar /><main className="flex-1 min-w-0">
    <div className="sticky top-0 z-40 flex items-center gap-4 border-b border-gray-100 bg-white px-8 py-5"><button aria-label="Back to dashboard" onClick={() => navigate('/admin')}><ArrowLeft className="size-5 text-gray-500" /></button><div><h1 className="text-xl font-extrabold text-gray-900">Refund Requests</h1><p className="text-xs text-gray-400">Cancellation requests for paid activity bookings</p></div><button disabled={loading} onClick={() => setRefresh(n => n + 1)} className="ml-auto flex items-center gap-2 rounded-xl bg-orange-50 px-4 py-2 text-sm font-semibold text-orange-600 disabled:opacity-50"><RefreshCw className={`size-4 ${loading ? 'animate-spin' : ''}`} />Refresh</button></div>
    <div className="p-8">{loading ? <p className="py-16 text-center text-gray-400">Loading refund requests…</p> : error ? <p role="alert" className="rounded-xl bg-red-50 p-5 text-red-600">{error}</p> : requests.length === 0 ? <p className="rounded-2xl border border-gray-100 bg-white py-16 text-center text-gray-400">No refund requests.</p> : <div className="overflow-x-auto rounded-2xl border border-gray-100 bg-white"><table className="w-full text-left text-sm"><thead className="bg-gray-50 text-xs text-gray-500"><tr>{['Activity / Booking', 'Participants', 'Requested', 'Amount Paid', 'Status', 'Transaction'].map(h => <th key={h} className="px-5 py-4 font-semibold">{h}</th>)}</tr></thead><tbody>{requests.map(r => {
      const created = new Date(r.createdAt);
      return <tr key={r.id} className="border-t border-gray-100"><td className="px-5 py-4"><p className="font-semibold text-gray-800">{activities.find(a => a.id === r.activityId)?.name || r.activityId}</p><p className="mt-1 text-xs text-gray-400">Booking: {r.id}</p><p className="mt-1 text-xs text-gray-400">User: {r.userId}</p><p className="mt-1 text-xs text-orange-600">{r.isGroupBooking ? 'Group booking' : 'Individual booking'}</p></td><td className="px-5 py-4">{(r.participantsName ?? []).map((name, i) => <div key={i} className="mb-2"><p>{name}</p><p className="text-xs text-gray-400">{r.participantsEmail?.[i] || '—'}</p></div>)}</td><td className="whitespace-nowrap px-5 py-4">{Number.isNaN(created.getTime()) ? '—' : created.toLocaleString('en-GB', { timeZone: 'Africa/Accra' })}</td><td className="whitespace-nowrap px-5 py-4 font-semibold">GH₵{Number(r.amountPaid).toFixed(2)}</td><td className="px-5 py-4"><span className="rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-700">{r.confirmationStatus === 'requestrefund' ? 'Refund requested' : r.confirmationStatus}</span><p className="mt-2 text-xs capitalize text-gray-500">{r.paymentStatus}</p></td><td className="px-5 py-4 text-xs text-gray-500">{r.transactionId || '—'}</td></tr>;
    })}</tbody></table></div>}</div>
  </main></div>;
}
