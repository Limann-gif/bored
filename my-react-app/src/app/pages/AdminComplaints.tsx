import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Sidebar } from '../components/Sidebar';
import { ArrowLeft, CheckCircle, XCircle, ChevronDown, ChevronUp, Flag } from 'lucide-react';

type ComplaintStatus = 'open' | 'resolved' | 'dismissed';
type Complaint = {
  id: string;
  user: string;
  email: string;
  subject: string;
  detail: string;
  category: string;
  status: ComplaintStatus;
  date: string;
};

const INITIAL_COMPLAINTS: Complaint[] = [
  { id: 'cmp-001', user: 'Morgan Lee', email: 'morgan@example.com', subject: 'Group member was inappropriate', detail: 'A member in my group made offensive comments during the activity. I felt uncomfortable and had to leave early.', category: 'Misconduct', status: 'open', date: '2026-03-20' },
  { id: 'cmp-002', user: 'Riley Taylor', email: 'riley@example.com', subject: 'Activity cancelled without notice', detail: 'The Urban Hiking activity was cancelled on the day itself with zero prior communication. Lost money on transport.', category: 'Activity', status: 'open', date: '2026-03-19' },
  { id: 'cmp-003', user: 'Casey Park', email: 'casey@example.com', subject: 'Wrong meeting point coordinates', detail: 'The map coordinates sent to our group were wrong. We spent 30 minutes in the wrong location before figuring it out.', category: 'Logistics', status: 'open', date: '2026-03-18' },
  { id: 'cmp-004', user: 'Jordan Smith', email: 'jordan@example.com', subject: 'Charged twice for subscription', detail: 'My credit card was billed twice this billing cycle for the same subscription tier.', category: 'Billing', status: 'resolved', date: '2026-03-15' },
  { id: 'cmp-005', user: 'Avery Johnson', email: 'avery@example.com', subject: 'Group members all no-showed', detail: 'I arrived at the meeting point but no one else showed up. The activity was marked as confirmed.', category: 'Attendance', status: 'resolved', date: '2026-03-14' },
  { id: 'cmp-006', user: 'Quinn Davis', email: 'quinn@example.com', subject: 'Hackathon misrepresented as beginner-friendly', detail: 'The listing said "all skill levels welcome" but the event assumed advanced programming knowledge.', category: 'Activity', status: 'dismissed', date: '2026-03-12' },
];

const categoryColor: Record<string, string> = {
  Misconduct: 'bg-red-50 text-red-500',
  Activity: 'bg-purple-50 text-purple-600',
  Logistics: 'bg-amber-50 text-amber-600',
  Billing: 'bg-blue-50 text-blue-600',
  Attendance: 'bg-orange-50 text-orange-500',
};

const statusStyle: Record<ComplaintStatus, string> = {
  open: 'bg-red-50 text-red-500',
  resolved: 'bg-green-50 text-green-600',
  dismissed: 'bg-gray-100 text-gray-400',
};

export default function AdminComplaints() {
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState<Complaint[]>(INITIAL_COMPLAINTS);
  const [filter, setFilter] = useState<'all' | ComplaintStatus>('all');
  const [expanded, setExpanded] = useState<string | null>(null);

  const updateStatus = (id: string, status: ComplaintStatus) => {
    setComplaints(prev => prev.map(c => c.id === id ? { ...c, status } : c));
  };

  const filtered = complaints.filter(c => filter === 'all' || c.status === filter);

  const counts = {
    all: complaints.length,
    open: complaints.filter(c => c.status === 'open').length,
    resolved: complaints.filter(c => c.status === 'resolved').length,
    dismissed: complaints.filter(c => c.status === 'dismissed').length,
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />

      <main className="flex-1 overflow-auto min-w-0">
        <div className="bg-white border-b border-gray-100 px-8 py-5 flex items-center gap-4 sticky top-0 z-40">
          <button onClick={() => navigate('/admin')} className="size-9 rounded-xl border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors">
            <ArrowLeft className="size-4" />
          </button>
          <div>
            <h1 className="text-xl font-extrabold text-gray-900">Handle Complaints</h1>
            <p className="text-sm text-gray-400 mt-0.5">Review and resolve user-submitted complaints.</p>
          </div>
          {counts.open > 0 && (
            <span className="ml-auto text-xs font-bold bg-red-50 text-red-500 px-3 py-1.5 rounded-full flex items-center gap-1.5">
              <Flag className="size-3" /> {counts.open} open
            </span>
          )}
        </div>

        <div className="px-8 py-6 space-y-5">
          {/* Filter tabs */}
          <div className="flex gap-2 flex-wrap">
            {(['all', 'open', 'resolved', 'dismissed'] as const).map(s => (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={`px-4 py-2 rounded-full text-sm font-semibold capitalize transition-colors ${
                  filter === s
                    ? 'bg-gray-900 text-white shadow-sm'
                    : 'bg-white text-gray-500 border border-gray-200 hover:bg-gray-50'
                }`}
              >
                {s} <span className={`ml-1 text-xs ${filter === s ? 'text-white/60' : 'text-gray-400'}`}>({counts[s]})</span>
              </button>
            ))}
          </div>

          {/* Complaints list */}
          <div className="space-y-3">
            {filtered.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm py-16 text-center text-sm text-gray-400">
                No complaints in this category.
              </div>
            ) : filtered.map(c => (
              <div key={c.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                {/* Row */}
                <div
                  className="flex items-center gap-4 px-6 py-4 cursor-pointer hover:bg-gray-50/50 transition-colors"
                  onClick={() => setExpanded(expanded === c.id ? null : c.id)}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${categoryColor[c.category] ?? 'bg-gray-100 text-gray-500'}`}>
                        {c.category}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${statusStyle[c.status]}`}>
                        {c.status}
                      </span>
                      <span className="text-xs text-gray-300 font-mono">{c.id}</span>
                    </div>
                    <p className="text-sm font-semibold text-gray-800 truncate">{c.subject}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {c.user} · {c.email} · {new Date(c.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                  <div className="shrink-0">
                    {expanded === c.id ? <ChevronUp className="size-4 text-gray-400" /> : <ChevronDown className="size-4 text-gray-400" />}
                  </div>
                </div>

                {/* Expanded detail */}
                {expanded === c.id && (
                  <div className="px-6 pb-5 border-t border-gray-50">
                    <p className="text-sm text-gray-600 leading-relaxed mt-4 mb-5 bg-gray-50 rounded-xl p-4">
                      {c.detail}
                    </p>
                    {c.status === 'open' ? (
                      <div className="flex gap-3">
                        <button
                          onClick={() => updateStatus(c.id, 'resolved')}
                          className="flex items-center gap-1.5 text-sm font-bold text-green-600 bg-green-50 hover:bg-green-100 px-4 py-2.5 rounded-xl transition-colors"
                        >
                          <CheckCircle className="size-4" /> Mark Resolved
                        </button>
                        <button
                          onClick={() => updateStatus(c.id, 'dismissed')}
                          className="flex items-center gap-1.5 text-sm font-bold text-gray-500 bg-gray-100 hover:bg-gray-200 px-4 py-2.5 rounded-xl transition-colors"
                        >
                          <XCircle className="size-4" /> Dismiss
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => updateStatus(c.id, 'open')}
                        className="text-xs font-semibold text-gray-400 hover:text-gray-600 underline transition-colors"
                      >
                        Reopen complaint
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
