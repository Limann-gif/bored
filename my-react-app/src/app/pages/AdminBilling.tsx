import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Sidebar } from '../components/Sidebar';
import { ArrowLeft, CreditCard, TrendingUp, Users, DollarSign, RefreshCw, AlertTriangle, CheckCircle } from 'lucide-react';

type TxnStatus = 'paid' | 'refunded' | 'failed';

type Transaction = {
  id: string;
  user: string;
  email: string;
  plan: 'Monthly' | 'Annual';
  amount: number;
  date: string;
  status: TxnStatus;
};

const TRANSACTIONS: Transaction[] = [
  { id: 'txn-001', user: 'Alex Chen', email: 'alex.chen@example.com', plan: 'Annual', amount: 99, date: '2026-03-07', status: 'paid' },
  { id: 'txn-002', user: 'Morgan Lee', email: 'morgan@example.com', plan: 'Monthly', amount: 12, date: '2026-03-15', status: 'paid' },
  { id: 'txn-003', user: 'Casey Park', email: 'casey@example.com', plan: 'Monthly', amount: 12, date: '2026-03-10', status: 'paid' },
  { id: 'txn-004', user: 'Riley Taylor', email: 'riley@example.com', plan: 'Annual', amount: 99, date: '2026-03-01', status: 'paid' },
  { id: 'txn-005', user: 'Jordan Smith', email: 'jordan@example.com', plan: 'Monthly', amount: 12, date: '2026-03-18', status: 'refunded' },
  { id: 'txn-006', user: 'Avery Johnson', email: 'avery@example.com', plan: 'Monthly', amount: 12, date: '2026-03-20', status: 'paid' },
  { id: 'txn-007', user: 'Quinn Davis', email: 'quinn@example.com', plan: 'Annual', amount: 99, date: '2026-03-05', status: 'paid' },
  { id: 'txn-008', user: 'Sam Rodriguez', email: 'sam@example.com', plan: 'Monthly', amount: 12, date: '2026-03-22', status: 'failed' },
];

const txnStyle: Record<TxnStatus, { badge: string; icon: React.ElementType }> = {
  paid: { badge: 'bg-green-50 text-green-600', icon: CheckCircle },
  refunded: { badge: 'bg-blue-50 text-blue-500', icon: RefreshCw },
  failed: { badge: 'bg-red-50 text-red-500', icon: AlertTriangle },
};

const totalRevenue = TRANSACTIONS.filter(t => t.status === 'paid').reduce((s, t) => s + t.amount, 0);
const monthlyRevenue = TRANSACTIONS.filter(t => t.status === 'paid' && t.plan === 'Monthly').reduce((s, t) => s + t.amount, 0);
const annualRevenue = TRANSACTIONS.filter(t => t.status === 'paid' && t.plan === 'Annual').reduce((s, t) => s + t.amount, 0);
const activeSubscribers = TRANSACTIONS.filter(t => t.status === 'paid').length;
const refundedCount = TRANSACTIONS.filter(t => t.status === 'refunded').length;
const failedCount = TRANSACTIONS.filter(t => t.status === 'failed').length;

export default function AdminBilling() {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState<'all' | TxnStatus>('all');

  const filtered = TRANSACTIONS.filter(t => statusFilter === 'all' || t.status === statusFilter);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />

      <main className="flex-1 overflow-auto min-w-0">
        <div className="bg-white border-b border-gray-100 px-8 py-5 flex items-center gap-4 sticky top-0 z-40">
          <button onClick={() => navigate('/admin')} className="size-9 rounded-xl border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors">
            <ArrowLeft className="size-4" />
          </button>
          <div>
            <h1 className="text-xl font-extrabold text-gray-900">Payment & Billing</h1>
            <p className="text-sm text-gray-400 mt-0.5">Revenue overview, subscriptions, and transactions.</p>
          </div>
        </div>

        <div className="px-8 py-6 space-y-8">
          {/* Stats */}
          <section>
            <h2 className="text-xs font-extrabold text-gray-400 uppercase tracking-widest mb-4">Revenue Overview</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {[
                { label: 'Total Revenue', value: `$${totalRevenue}`, sub: 'this period', icon: DollarSign, bg: 'bg-green-50', color: 'text-green-500' },
                { label: 'Monthly Revenue', value: `$${monthlyRevenue}`, sub: 'monthly plans', icon: TrendingUp, bg: 'bg-blue-50', color: 'text-blue-500' },
                { label: 'Annual Revenue', value: `$${annualRevenue}`, sub: 'annual plans', icon: TrendingUp, bg: 'bg-purple-50', color: 'text-purple-500' },
                { label: 'Active Subscribers', value: activeSubscribers, sub: 'paid accounts', icon: Users, bg: 'bg-pink-50', color: 'text-pink-500' },
                { label: 'Refunds', value: refundedCount, sub: 'this period', icon: RefreshCw, bg: 'bg-amber-50', color: 'text-amber-500' },
                { label: 'Failed Payments', value: failedCount, sub: 'need attention', icon: AlertTriangle, bg: 'bg-red-50', color: 'text-red-400' },
              ].map(({ label, value, sub, icon: Icon, bg, color }) => (
                <div key={label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                  <div className={`size-10 rounded-xl ${bg} flex items-center justify-center mb-3`}>
                    <Icon className={`size-5 ${color}`} />
                  </div>
                  <p className="text-2xl font-extrabold text-gray-900 leading-none">{value}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{sub}</p>
                  <p className="text-sm text-gray-500 font-medium mt-1">{label}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Subscription Breakdown */}
          <section>
            <h2 className="text-xs font-extrabold text-gray-400 uppercase tracking-widest mb-4">Subscription Breakdown</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { label: 'Monthly Plan', count: TRANSACTIONS.filter(t => t.plan === 'Monthly' && t.status === 'paid').length, price: '$12/mo', color: 'from-blue-500 to-indigo-600', pct: '43%' },
                { label: 'Annual Plan', count: TRANSACTIONS.filter(t => t.plan === 'Annual' && t.status === 'paid').length, price: '$99/yr', color: 'from-purple-500 to-pink-500', pct: '57%' },
                { label: 'Free / Trial', count: 2, price: '$0', color: 'from-gray-400 to-gray-500', pct: '20%' },
              ].map(({ label, count, price, color, pct }) => (
                <div key={label} className={`rounded-2xl bg-gradient-to-br ${color} p-5 text-white`}>
                  <p className="text-3xl font-extrabold leading-none mb-1">{count}</p>
                  <p className="text-white/80 text-xs mb-3">{pct} of subscribers</p>
                  <div className="flex items-center justify-between">
                    <p className="font-extrabold text-sm">{label}</p>
                    <span className="text-xs bg-white/20 px-2 py-1 rounded-full font-semibold">{price}</span>
                  </div>
                  {/* Mini progress bar */}
                  <div className="mt-3 h-1.5 bg-white/20 rounded-full overflow-hidden">
                    <div className="h-full bg-white/60 rounded-full" style={{ width: pct }} />
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Transactions */}
          <section>
            <div className="flex items-center gap-3 mb-4 flex-wrap">
              <h2 className="text-xs font-extrabold text-gray-400 uppercase tracking-widest">Recent Transactions</h2>
              <div className="flex gap-2 ml-auto">
                {(['all', 'paid', 'refunded', 'failed'] as const).map(s => (
                  <button
                    key={s}
                    onClick={() => setStatusFilter(s)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold capitalize transition-colors ${
                      statusFilter === s
                        ? 'bg-gray-900 text-white'
                        : 'bg-white text-gray-500 border border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/60">
                    <th className="px-6 py-3.5 text-left text-xs font-extrabold text-gray-400 uppercase tracking-wider">ID</th>
                    <th className="px-6 py-3.5 text-left text-xs font-extrabold text-gray-400 uppercase tracking-wider">User</th>
                    <th className="px-6 py-3.5 text-left text-xs font-extrabold text-gray-400 uppercase tracking-wider">Plan</th>
                    <th className="px-6 py-3.5 text-left text-xs font-extrabold text-gray-400 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-3.5 text-left text-xs font-extrabold text-gray-400 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3.5 text-left text-xs font-extrabold text-gray-400 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3.5 text-left text-xs font-extrabold text-gray-400 uppercase tracking-wider">Receipt</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtered.map(txn => {
                    const { badge, icon: StatusIcon } = txnStyle[txn.status];
                    return (
                      <tr key={txn.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-4 text-xs font-mono text-gray-400">{txn.id}</td>
                        <td className="px-6 py-4">
                          <p className="text-sm font-semibold text-gray-800">{txn.user}</p>
                          <p className="text-xs text-gray-400">{txn.email}</p>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${txn.plan === 'Annual' ? 'bg-purple-50 text-purple-600' : 'bg-blue-50 text-blue-500'}`}>
                            {txn.plan}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm font-bold text-gray-800">${txn.amount}</td>
                        <td className="px-6 py-4 text-sm text-gray-400">
                          {new Date(txn.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`flex items-center gap-1.5 w-fit text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${badge}`}>
                            <StatusIcon className="size-3" /> {txn.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <button className="flex items-center gap-1 text-xs text-pink-500 hover:text-pink-600 font-semibold transition-colors">
                            <CreditCard className="size-3.5" /> View
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
