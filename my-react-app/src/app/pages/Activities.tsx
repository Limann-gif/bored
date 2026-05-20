import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { ActivityCard } from '../components/ActivityCard';
import { Sidebar } from '../components/Sidebar';
import { Input } from '../components/ui/input';
import {
  Search, Filter, Bell, Plus, ChevronRight,
  User, Users, MapPin, Calendar, Minus, Gift, Mail,
} from 'lucide-react';
import { format } from 'date-fns';
import type { Activity } from '../types';

// Seed signups so progress bars look interesting in group mode
const MOCK_BASE_SIGNUPS: Record<string, number> = {
  'act-1': 8, 'act-2': 12, 'act-3': 6, 'act-4': 18,
  'act-5': 4,  'act-6': 10, 'act-7': 15, 'act-8': 7,
  'act-9': 11, 'act-10': 9,
};

// ─── Group-mode activity card ──────────────────────────────────────────────
function GroupActivityCard({
  activity,
  signups,
  groupSize,
  onBook,
}: {
  activity: Activity;
  signups: number;
  groupSize: number;
  onBook: () => void;
}) {
  const remaining = activity.capacity - signups;
  const fillPct = Math.min(100, Math.round((signups / activity.capacity) * 100));
  const canFit = remaining >= groupSize;
  const totalCost = activity.price * groupSize;

  return (
    <div
      className={`bg-white rounded-2xl border shadow-sm overflow-hidden flex flex-col transition-all duration-200 ${
        canFit
          ? 'border-gray-100 hover:shadow-md hover:-translate-y-0.5 cursor-pointer'
          : 'border-gray-100 opacity-60'
      }`}
    >
      {/* Image */}
      <div className="relative h-44 overflow-hidden">
        <img
          src={activity.image}
          alt={activity.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
        <span className="absolute top-3 left-3 bg-pink-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
          {activity.category}
        </span>
        <span
          className={`absolute top-3 right-3 text-[10px] font-bold px-2.5 py-1 rounded-full ${
            canFit ? 'bg-white/90 text-gray-700' : 'bg-black/60 text-white'
          }`}
        >
          {canFit ? `${remaining} spots left` : 'Not enough spots'}
        </span>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1 gap-3">
        <div>
          <h3 className="font-bold text-gray-900 text-base leading-snug mb-1">{activity.name}</h3>
          <div className="flex items-center gap-1 text-gray-400 text-xs">
            <MapPin className="size-3 shrink-0" />
            <span>{activity.location}</span>
            <span className="mx-1">·</span>
            <Calendar className="size-3 shrink-0" />
            <span>{format(new Date(activity.date), 'EEE, MMM d')}</span>
          </div>
        </div>

        {/* Signups progress */}
        <div>
          <div className="flex justify-between text-[11px] text-gray-400 mb-1.5">
            <span><span className="font-semibold text-gray-600">{signups}</span> signed up</span>
            <span>{activity.capacity} total spots</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                fillPct > 80
                  ? 'bg-gradient-to-r from-red-400 to-orange-400'
                  : 'bg-gradient-to-r from-pink-400 to-purple-500'
              }`}
              style={{ width: `${fillPct}%` }}
            />
          </div>
        </div>

        {/* Price + CTA */}
        <div className="flex items-center justify-between mt-auto pt-1">
          <div>
            <p className="text-sm font-bold text-pink-500">${activity.price}<span className="text-gray-400 font-normal">/pp</span></p>
            {groupSize > 1 && (
              <p className="text-xs text-gray-400">~<span className="font-semibold text-gray-600">${totalCost}</span> for {groupSize}</p>
            )}
          </div>
          {canFit ? (
            <button
              onClick={onBook}
              className="flex items-center gap-1.5 bg-gradient-to-r from-pink-500 to-purple-600 text-white text-xs font-bold px-4 py-2.5 rounded-full hover:opacity-90 transition-opacity shadow-sm"
            >
              <Users className="size-3.5" /> Book for {groupSize}
            </button>
          ) : (
            <span className="text-xs text-gray-400 font-semibold bg-gray-100 px-3 py-2 rounded-full">Full</span>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main page ─────────────────────────────────────────────────────────────
export default function Activities() {
  const { user } = useAuth();
  const { activities, activitiesLoading, activitiesError, groups, userSelections } = useApp();
  const navigate = useNavigate();

  const [mode, setMode] = useState<'individual' | 'group'>('individual');
  const [groupSize, setGroupSize] = useState(2);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedVibes, setSelectedVibes] = useState<string[]>([]);

  if (user?.subscriptionStatus !== 'active') {
    navigate('/');
    return null;
  }

  const categories = useMemo(() => Array.from(new Set(activities.map(a => a.category))), [activities]);
  const allVibes = useMemo(() => Array.from(new Set(activities.flatMap(a => a.vibes))), [activities]);

  const filteredActivities = useMemo(() => activities.filter(activity => {
    const matchesSearch = activity.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || activity.category === selectedCategory;
    const matchesVibes = selectedVibes.length === 0 ||
      selectedVibes.some(vibe => activity.vibes.includes(vibe));
    return matchesSearch && matchesCategory && matchesVibes;
  }), [activities, searchTerm, selectedCategory, selectedVibes]);

  const getActivitySignups = (activityId: string) => {
    const fromGroups = groups
      .filter(g => g.activityId === activityId && (g.status === 'confirmed' || g.status === 'forming'))
      .reduce((sum, g) => sum + g.members.length, 0);
    const fromSelections = userSelections.filter(s => s.activityId === activityId).length;
    return (MOCK_BASE_SIGNUPS[activityId] ?? 0) + fromGroups + fromSelections;
  };

  const groupEligibleActivities = useMemo(() => filteredActivities.filter(a => {
    const remaining = a.capacity - getActivitySignups(a.id);
    return remaining >= groupSize;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [filteredActivities, groupSize, groups, userSelections]);

  const toggleVibe = (vibe: string) => {
    setSelectedVibes(prev => prev.includes(vibe) ? prev.filter(v => v !== vibe) : [...prev, vibe]);
  };

  if (activitiesLoading || activitiesError || activities.length === 0) {
    const message = activitiesLoading
      ? 'Loading activities...'
      : activitiesError
        ? `Could not load activities: ${activitiesError}`
        : 'No activities available yet.';
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <main className="flex-1 flex items-center justify-center text-gray-400 text-sm">
          {message}
        </main>
      </div>
    );
  }

  const featuredActivity = activities[0];
  const firstName = user.name.split(' ')[0];
  const avatarColors = ['#f97316', '#ec4899', '#a855f7', '#3b82f6'];

  const searchFilter = (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 space-y-4">
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
        <Input
          type="text"
          placeholder="Search activities..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="pl-10 bg-gray-50 border-gray-200 rounded-xl focus-visible:ring-pink-400"
        />
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        <span className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
          <Filter className="size-3.5" /> Category
        </span>
        <button
          onClick={() => setSelectedCategory(null)}
          className={`px-3.5 py-1.5 rounded-full text-sm font-semibold transition-colors ${
            selectedCategory === null ? 'bg-pink-500 text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          All
        </button>
        {categories.map(category => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-3.5 py-1.5 rounded-full text-sm font-semibold transition-colors ${
              selectedCategory === category ? 'bg-pink-500 text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {category}
          </button>
        ))}
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Vibes</span>
        {allVibes.map(vibe => (
          <button
            key={vibe}
            onClick={() => toggleVibe(vibe)}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
              selectedVibes.includes(vibe)
                ? 'bg-pink-100 text-pink-600 ring-1 ring-pink-400'
                : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
            }`}
          >
            {vibe}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />

      <main className="flex-1 overflow-auto min-w-0">
        {/* Top bar */}
        <div className="bg-white border-b border-gray-100 px-8 py-5 flex items-center justify-between sticky top-0 z-40">
          <div>
            <h1 className="text-xl font-extrabold text-gray-900">Welcome back, {firstName}!</h1>
            <p className="text-sm text-gray-400 mt-0.5">Start living your best life in the city today.</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="size-10 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors">
              <Bell className="size-4" />
            </button>
            <button className="flex items-center gap-2 bg-pink-500 text-white px-4 py-2.5 rounded-full text-sm font-bold hover:bg-pink-600 transition-colors shadow-sm">
              <Plus className="size-4" />
              New Post
            </button>
          </div>
        </div>

        <div className="px-8 py-6 space-y-6">

          {/* ── Mode Toggle ─────────────────────────── */}
          <div className="flex gap-3">
            <button
              onClick={() => setMode('individual')}
              className={`flex items-center gap-2.5 px-5 py-3.5 rounded-2xl text-sm font-bold transition-all ${
                mode === 'individual'
                  ? 'bg-gray-900 text-white shadow-md'
                  : 'bg-white text-gray-500 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              <User className={`size-4 ${mode === 'individual' ? 'text-white' : 'text-gray-400'}`} />
              Individual
            </button>
            <button
              onClick={() => setMode('group')}
              className={`flex items-center gap-2.5 px-5 py-3.5 rounded-2xl text-sm font-bold transition-all ${
                mode === 'group'
                  ? 'bg-gradient-to-r from-purple-600 to-pink-500 text-white shadow-md'
                  : 'bg-white text-gray-500 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              <Users className={`size-4 ${mode === 'group' ? 'text-white' : 'text-gray-400'}`} />
              With Friends
              <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-full ${
                mode === 'group' ? 'bg-white/20 text-white' : 'bg-purple-100 text-purple-600'
              }`}>
                NEW
              </span>
            </button>
          </div>

          {/* ── INDIVIDUAL MODE ─────────────────────── */}
          {mode === 'individual' && (
            <>
              {/* Hero */}
              <div
                className="relative rounded-3xl overflow-hidden h-64 cursor-pointer group"
                onClick={() => navigate(`/activity/${featuredActivity.id}`)}
              >
                <img
                  src={featuredActivity.image}
                  alt={featuredActivity.name}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/45 to-black/10" />
                <div className="relative h-full flex flex-col justify-between p-8">
                  <span className="self-start bg-pink-500 text-white text-[10px] font-extrabold px-3 py-1.5 rounded-full uppercase tracking-widest">
                    Upcoming Group Activity
                  </span>
                  <div className="flex items-end justify-between gap-4">
                    <div>
                      <h2 className="text-2xl font-extrabold text-white mb-1 leading-tight">{featuredActivity.name}</h2>
                      <p className="text-white/70 text-sm max-w-md leading-relaxed">{featuredActivity.description.slice(0, 85)}…</p>
                      <div className="flex items-center gap-2.5 mt-3">
                        <div className="flex -space-x-2">
                          {avatarColors.map((color, i) => (
                            <div key={i} className="size-8 rounded-full border-2 border-white" style={{ backgroundColor: color }} />
                          ))}
                          <div className="size-8 rounded-full border-2 border-white bg-gray-600 flex items-center justify-center text-white text-[10px] font-bold">+2</div>
                        </div>
                        <span className="text-white/80 text-sm font-medium">5 people matched</span>
                      </div>
                    </div>
                    <button
                      className="shrink-0 flex items-center gap-2 bg-white text-gray-900 font-bold px-5 py-3 rounded-2xl text-sm hover:bg-gray-50 transition-colors"
                      onClick={e => { e.stopPropagation(); navigate(`/activity/${featuredActivity.id}`); }}
                    >
                      View Details <ChevronRight className="size-4" />
                    </button>
                  </div>
                </div>
              </div>

              {searchFilter}

              <p className="text-sm text-gray-400 font-medium">
                {filteredActivities.length} {filteredActivities.length === 1 ? 'activity' : 'activities'} found
              </p>

              {filteredActivities.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
                  <p className="text-gray-500 text-base mb-3">No activities match your filters.</p>
                  <button
                    onClick={() => { setSearchTerm(''); setSelectedCategory(null); setSelectedVibes([]); }}
                    className="text-pink-500 font-semibold text-sm hover:underline"
                  >
                    Clear all filters
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                  {filteredActivities.map(activity => <ActivityCard key={activity.id} activity={activity} />)}
                </div>
              )}
            </>
          )}

          {/* ── GROUP MODE ──────────────────────────── */}
          {mode === 'group' && (
            <>
              {/* Hero banner */}
              <div className="relative rounded-3xl overflow-hidden h-52 bg-gradient-to-br from-purple-700 via-purple-500 to-pink-500">
                <div className="absolute inset-0 opacity-10"
                  style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)', backgroundSize: '30px 30px' }}
                />
                <div className="relative h-full flex flex-col justify-center px-8">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs font-extrabold bg-white/20 text-white px-3 py-1 rounded-full uppercase tracking-widest">
                      Bored! for Friends
                    </span>
                  </div>
                  <h2 className="text-3xl font-extrabold text-white leading-tight">Plan the perfect outing,<br />together.</h2>
                  <p className="text-white/75 text-sm mt-2 max-w-md leading-relaxed">
                    Pick an activity, add your crew, and book for everyone — invite them to pay their share or make it a surprise on you.
                  </p>
                  <div className="flex items-center gap-4 mt-4">
                    <span className="flex items-center gap-1.5 text-white/80 text-xs font-semibold">
                      <Mail className="size-3.5" /> Invite friends
                    </span>
                    <span className="text-white/40">·</span>
                    <span className="flex items-center gap-1.5 text-white/80 text-xs font-semibold">
                      <Gift className="size-3.5" /> Surprise booking
                    </span>
                    <span className="text-white/40">·</span>
                    <span className="flex items-center gap-1.5 text-white/80 text-xs font-semibold">
                      <Users className="size-3.5" /> Group payment
                    </span>
                  </div>
                </div>
              </div>

              {/* Group size selector */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4 flex-wrap">
                <div>
                  <p className="text-sm font-extrabold text-gray-900">How many people in your group?</p>
                  <p className="text-xs text-gray-400 mt-0.5">Include yourself. Only activities with enough spots will show.</p>
                </div>
                <div className="ml-auto flex items-center gap-3">
                  <button
                    onClick={() => setGroupSize(s => Math.max(2, s - 1))}
                    className="size-9 rounded-xl border border-gray-200 flex items-center justify-center text-gray-600 font-bold hover:bg-gray-50 transition-colors"
                  >
                    <Minus className="size-4" />
                  </button>
                  <span className="text-2xl font-extrabold text-gray-900 w-10 text-center">{groupSize}</span>
                  <button
                    onClick={() => setGroupSize(s => Math.min(10, s + 1))}
                    className="size-9 rounded-xl border border-gray-200 flex items-center justify-center text-gray-600 font-bold hover:bg-gray-50 transition-colors"
                  >
                    <Plus className="size-4" />
                  </button>
                  <span className="text-sm text-gray-400 font-medium">people</span>
                </div>
              </div>

              {searchFilter}

              <p className="text-sm text-gray-400 font-medium">
                <span className="font-semibold text-gray-600">{groupEligibleActivities.length}</span> activities with enough spots for {groupSize}
                {filteredActivities.length - groupEligibleActivities.length > 0 && (
                  <span className="ml-2 text-gray-300">· {filteredActivities.length - groupEligibleActivities.length} full</span>
                )}
              </p>

              {filteredActivities.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
                  <p className="text-gray-500 text-base mb-3">No activities match your filters.</p>
                  <button
                    onClick={() => { setSearchTerm(''); setSelectedCategory(null); setSelectedVibes([]); }}
                    className="text-pink-500 font-semibold text-sm hover:underline"
                  >
                    Clear all filters
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                  {filteredActivities.map(activity => (
                    <GroupActivityCard
                      key={activity.id}
                      activity={activity}
                      signups={getActivitySignups(activity.id)}
                      groupSize={groupSize}
                      onBook={() => navigate(`/group-booking/${activity.id}`, { state: { groupSize } })}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
