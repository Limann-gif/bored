import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useApp } from '../context/AppContext';
import { Sidebar } from '../components/Sidebar';
import { Input } from '../components/ui/input';
import { ArrowLeft, Plus, Trash2, Search, X } from 'lucide-react';
import type { Activity } from '../types';

const CATEGORIES = ['Outdoor', 'Indoor', 'Food & Drink', 'Wellness', 'Arts & Crafts', 'Entertainment', 'Tech', 'Dance', 'Sports'];

const EMPTY_FORM = {
  name: '',
  description: '',
  category: 'Indoor',
  price: '',
  capacity: '',
  location: '',
  groupMin: '4',
  groupMax: '6',
  date: '',
  vibes: '',
  image: '',
};

export default function AdminActivities() {
  const { activities, addActivity, removeActivity } = useApp();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const filtered = activities.filter(
    a => !search || a.name.toLowerCase().includes(search.toLowerCase()) || a.category.toLowerCase().includes(search.toLowerCase())
  );

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = 'Name is required.';
    if (!form.description.trim()) e.description = 'Description is required.';
    if (!form.price || isNaN(Number(form.price))) e.price = 'Valid price required.';
    if (!form.capacity || isNaN(Number(form.capacity))) e.capacity = 'Valid capacity required.';
    if (!form.location.trim()) e.location = 'Location is required.';
    if (!form.date) e.date = 'Date is required.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    const newActivity: Activity = {
      id: '',
      name: form.name.trim(),
      description: form.description.trim(),
      category: form.category,
      price: Number(form.price),
      capacity: Number(form.capacity),
      location: form.location.trim(),
      date: new Date(form.date),
      groupSize: { min: Number(form.groupMin), max: Number(form.groupMax) },
      vibes: form.vibes.split(',').map(v => v.trim()).filter(Boolean),
      image: form.image.trim() || null!,
    };
    setSubmitting(true);
    setSubmitError('');
    try {
      await addActivity(newActivity);
      setForm(EMPTY_FORM);
      setErrors({});
      setShowModal(false);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to add activity');
    } finally {
      setSubmitting(false);
    }
  };

  const set = (key: keyof typeof EMPTY_FORM) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(prev => ({ ...prev, [key]: e.target.value }));

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />

      {/* Add Activity Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100">
              <h2 className="text-lg font-extrabold text-gray-900">Add New Activity</h2>
              <button onClick={() => { setShowModal(false); setErrors({}); }} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X className="size-5" />
              </button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Activity Name *</label>
                <Input value={form.name} onChange={set('name')} placeholder="e.g. Sunset Picnic" className="mt-1" />
                {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Description *</label>
                <textarea
                  value={form.description}
                  onChange={set('description')}
                  placeholder="Describe the activity..."
                  rows={3}
                  className="mt-1 w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 resize-none focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent"
                />
                {errors.description && <p className="text-xs text-red-500 mt-1">{errors.description}</p>}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Category</label>
                  <select
                    value={form.category}
                    onChange={set('category')}
                    className="mt-1 w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-pink-400 bg-white"
                  >
                    {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Price ($) *</label>
                  <Input type="number" value={form.price} onChange={set('price')} placeholder="25" className="mt-1" />
                  {errors.price && <p className="text-xs text-red-500 mt-1">{errors.price}</p>}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Capacity *</label>
                  <Input type="number" value={form.capacity} onChange={set('capacity')} placeholder="20" className="mt-1" />
                  {errors.capacity && <p className="text-xs text-red-500 mt-1">{errors.capacity}</p>}
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Date *</label>
                  <Input type="date" value={form.date} onChange={set('date')} className="mt-1" />
                  {errors.date && <p className="text-xs text-red-500 mt-1">{errors.date}</p>}
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Location *</label>
                <Input value={form.location} onChange={set('location')} placeholder="e.g. Downtown Park" className="mt-1" />
                {errors.location && <p className="text-xs text-red-500 mt-1">{errors.location}</p>}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Group Min</label>
                  <Input type="number" value={form.groupMin} onChange={set('groupMin')} className="mt-1" />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Group Max</label>
                  <Input type="number" value={form.groupMax} onChange={set('groupMax')} className="mt-1" />
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Vibes (comma-separated)</label>
                <Input value={form.vibes} onChange={set('vibes')} placeholder="e.g. social, chill, outdoor" className="mt-1" />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Image URL (optional)</label>
                <Input value={form.image} onChange={set('image')} placeholder="https://..." className="mt-1" />
              </div>
            </div>
            {submitError && (
              <p className="px-6 pb-2 text-sm text-red-500">{submitError}</p>
            )}
            <div className="px-6 pb-6 flex gap-3">
              <button
                onClick={() => { setShowModal(false); setErrors({}); setSubmitError(''); setForm(EMPTY_FORM); }}
                className="flex-1 py-3 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 text-white text-sm font-bold hover:opacity-90 transition-opacity disabled:opacity-60"
              >
                {submitting ? 'Adding...' : 'Add Activity'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-80">
            <h3 className="font-extrabold text-gray-900 mb-2">Remove Activity?</h3>
            <p className="text-sm text-gray-500 mb-5">This will permanently remove the activity and cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteTarget(null)} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors">Cancel</button>
              <button
                onClick={() => { removeActivity(deleteTarget); setDeleteTarget(null); }}
                className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-bold hover:bg-red-600 transition-colors"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}

      <main className="flex-1 overflow-auto min-w-0">
        <div className="bg-white border-b border-gray-100 px-8 py-5 flex items-center gap-4 sticky top-0 z-40">
          <button onClick={() => navigate('/admin')} className="size-9 rounded-xl border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors">
            <ArrowLeft className="size-4" />
          </button>
          <div>
            <h1 className="text-xl font-extrabold text-gray-900">Manage Activities</h1>
            <p className="text-sm text-gray-400 mt-0.5">Add or remove activities from the platform.</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="ml-auto flex items-center gap-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white px-4 py-2.5 rounded-full text-sm font-bold hover:opacity-90 transition-opacity shadow-sm"
          >
            <Plus className="size-4" /> Add Activity
          </button>
        </div>

        <div className="px-8 py-6 space-y-5">
          <div className="relative max-w-sm">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
            <Input
              placeholder="Search activities..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-10 bg-white border-gray-200 rounded-xl"
            />
          </div>

          <p className="text-xs text-gray-400 font-semibold">{filtered.length} activities</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filtered.map(activity => (
              <div key={activity.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden group">
                <div className="relative h-40 overflow-hidden">
                  <img
                    src={activity.image}
                    alt={activity.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  <span className="absolute top-2.5 left-2.5 bg-white/90 text-gray-700 text-[10px] font-bold px-2.5 py-1 rounded-full">
                    {activity.category}
                  </span>
                  <button
                    onClick={() => setDeleteTarget(activity.id)}
                    className="absolute top-2.5 right-2.5 size-7 bg-red-500 text-white rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                    title="Remove activity"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
                <div className="p-4">
                  <h3 className="text-sm font-extrabold text-gray-900 leading-tight mb-1">{activity.name}</h3>
                  <p className="text-xs text-gray-400 line-clamp-2 mb-3">{activity.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-pink-500">${activity.price}</span>
                    <span className="text-xs text-gray-400">
                      {new Date(activity.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-1.5 text-xs text-gray-400">
                    <span>Cap: {activity.capacity}</span>
                    <span>Group: {activity.groupSize.min}–{activity.groupSize.max}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
