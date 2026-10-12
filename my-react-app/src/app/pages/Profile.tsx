import { useEffect, useState } from 'react';
import { apiService, type AdminUserDetail, type ProfileUpdate } from '../../services/api';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { Sidebar } from '../components/Sidebar';
import { toast } from 'sonner';
import {
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Calendar,
  Star,
  Users,
  Activity,
  ShieldCheck,
} from 'lucide-react';

export default function Profile() {
  const { user } = useAuth();
  const { getUserGroups, activities: allActivities } = useApp();
  const userId = user?.id;
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [draft, setDraft] = useState<ProfileUpdate>({ phoneNumber: '', location: '', ocupation: '', bio: '' });
  const [membership, setMembership] = useState<{ userId: string; details: AdminUserDetail | null; error: boolean } | null>(null);

  useEffect(() => {
    if (!userId) return;
    let active = true;
    apiService.getUserById(userId)
      .then(details => {
        if (active) setMembership({ userId, details, error: false });
      })
      .catch(() => {
        if (active) setMembership({ userId, details: null, error: true });
      });
    return () => { active = false; };
  }, [userId]);

  const currentMembership = membership?.userId === userId ? membership : null;
  const profile = currentMembership?.details;
  const openEditor = () => {
    if (!profile) return;
    setDraft({ phoneNumber: profile.phone || '', location: profile.locationAddress || '', ocupation: profile.occupation || '', bio: profile.bio || '' });
    setSaveError('');
    setEditing(true);
  };
  const saveProfile = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!userId || !profile || saving) return;
    setSaving(true); setSaveError('');
    try {
      const updates = Object.fromEntries(Object.entries(draft).map(([key, value]) => [key, value.trim()])) as unknown as ProfileUpdate;
      const result = await apiService.updateProfile(userId, updates);
      setMembership(current => current?.userId === userId && current.details ? { ...current, details: { ...current.details, ...result.profile } } : current);
      setEditing(false);
      toast.success(result.message);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Could not update your profile.');
    } finally { setSaving(false); }
  };
  const joinedDate = profile?.joinedAt ? new Date(profile.joinedAt) : null;
  const memberSince = !currentMembership ? 'Loading…'
    : currentMembership.error ? 'Unable to load'
    : joinedDate && !Number.isNaN(joinedDate.getTime())
      ? joinedDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
      : 'Not available';

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Please log in to view your profile.</p>
      </div>
    );
  }

  const myGroups = getUserGroups();
  const displayName = profile?.name ?? user.name;
  const initials = displayName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  const gradFrom = '#ff784b';
  const gradTo = '#ff501b';
  const unavailable = currentMembership?.error ? 'Unable to load' : 'Loading…';

  return (
    <div className="app-shell flex min-h-screen flex-col lg:flex-row bg-gray-50">
      <Sidebar />

      <main className="flex-1 overflow-auto min-w-0">
        {/* Header */}
        <div className="bg-white border-b border-gray-100 px-4 sm:px-6 lg:px-8 py-5 sticky top-0 z-40">
          <h1 className="text-xl font-extrabold text-gray-900">My Profile</h1>
          <p className="text-sm text-gray-400 mt-0.5">{displayName}</p>
        </div>

        <div className="px-4 sm:px-6 lg:px-8 py-8 max-w-4xl space-y-6">
          {currentMembership?.error && <p role="alert" className="rounded-xl bg-red-50 p-4 text-sm text-red-600">Unable to load your profile details. Please refresh to try again.</p>}
          {editing && <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm" aria-labelledby="edit-profile-title"><h2 id="edit-profile-title" className="mb-5 text-lg font-bold text-gray-900">Update Profile</h2><form onSubmit={saveProfile} className="space-y-4"><div className="grid gap-4 sm:grid-cols-2">{([{ key: 'phoneNumber', label: 'Phone number', type: 'tel', autocomplete: 'tel' }, { key: 'location', label: 'Location', type: 'text', autocomplete: 'address-level2' }, { key: 'ocupation', label: 'Occupation', type: 'text', autocomplete: 'organization-title' }] as const).map(field => <label key={field.key} className="grid gap-1.5 text-sm font-semibold text-gray-700">{field.label}<input type={field.type} autoComplete={field.autocomplete} value={draft[field.key]} disabled={saving} onChange={event => setDraft(current => ({ ...current, [field.key]: event.target.value }))} className="rounded-xl border border-gray-200 px-3 py-2 text-sm font-normal focus:border-orange-400" /></label>)}</div><label className="grid gap-1.5 text-sm font-semibold text-gray-700">Bio<textarea value={draft.bio} disabled={saving} onChange={event => setDraft(current => ({ ...current, bio: event.target.value }))} rows={4} className="rounded-xl border border-gray-200 px-3 py-2 text-sm font-normal focus:border-orange-400" /></label>{saveError && <p role="alert" className="text-sm text-red-600">{saveError}</p>}<div className="flex gap-3"><button type="submit" disabled={saving} className="rounded-xl bg-orange-500 px-5 py-2 text-sm font-bold text-white hover:bg-orange-600 disabled:opacity-50">{saving ? 'Saving…' : 'Save changes'}</button><button type="button" disabled={saving} onClick={() => setEditing(false)} className="rounded-xl border border-gray-200 px-5 py-2 text-sm font-semibold text-gray-600">Cancel</button></div></form></section>}
          {/* Profile hero card */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
            {/* Banner */}
            <div
              className="h-32"
              style={{ background: `linear-gradient(135deg, ${gradFrom}, ${gradTo})` }}
            />

            <div className="px-4 sm:px-6 lg:px-8 pb-8">
              {/* Avatar overlapping banner */}
              <div className="flex items-end justify-between -mt-12 mb-5">
                <div
                  className="size-24 rounded-2xl border-4 border-white shadow-md flex items-center justify-center text-white text-3xl font-extrabold shrink-0"
                  style={{ background: `linear-gradient(135deg, ${gradFrom}, ${gradTo})` }}
                >
                  {initials}
                </div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="flex items-center gap-1.5 text-xs font-bold bg-gradient-to-r from-yellow-400 to-orange-400 text-white px-3 py-1.5 rounded-full">
                    <Star className="size-3.5 fill-white" /> Gold Member
                  </span>
                  <span className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full border bg-green-50 text-green-600 border-green-100">
                    <ShieldCheck className="size-3.5" /> Active
                  </span>
                </div>
              </div>

              {/* Name & occupation */}
              <div className="flex flex-wrap items-center gap-4"><h2 className="text-2xl font-extrabold text-gray-900 leading-tight">{displayName}</h2><button onClick={openEditor} disabled={!profile || saving || editing} className="rounded-xl bg-orange-500 px-4 py-2 text-sm font-bold text-white hover:bg-orange-600 disabled:opacity-50">Update Profile</button></div>
              <p className="text-sm text-gray-500 mt-0.5 flex items-center gap-1.5">
                <Briefcase className="size-3.5 text-gray-400" />
                {profile ? profile.occupation || 'Not specified' : unavailable}
              </p>

              {/* Bio */}
              <p className="text-sm text-gray-500 mt-4 leading-relaxed max-w-lg">{profile ? profile.bio || 'No bio available.' : unavailable}</p>
            </div>
          </div>

          {/* Details grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Contact info */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
              <h3 className="text-xs font-extrabold text-gray-400 uppercase tracking-widest">Contact Information</h3>

              <div className="flex items-start gap-3">
                <div className="size-9 rounded-xl bg-orange-50 flex items-center justify-center shrink-0">
                  <Mail className="size-4 text-orange-500" />
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Email</p>
                  <p className="text-sm font-semibold text-gray-800 mt-0.5">{profile ? profile.email || 'Not provided' : unavailable}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="size-9 rounded-xl bg-orange-50 flex items-center justify-center shrink-0">
                  <Phone className="size-4 text-orange-500" />
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Phone Number</p>
                  <p className="text-sm font-semibold text-gray-800 mt-0.5">{profile ? profile.phone || 'Not provided' : unavailable}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="size-9 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                  <MapPin className="size-4 text-blue-500" />
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Location</p>
                  <p className="text-sm font-semibold text-gray-800 mt-0.5">
                    {profile ? profile.locationAddress || 'Not provided' : unavailable}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="size-9 rounded-xl bg-amber-50 flex items-center justify-center shrink-0">
                  <Briefcase className="size-4 text-amber-500" />
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Occupation</p>
                  <p className="text-sm font-semibold text-gray-800 mt-0.5">{profile ? profile.occupation || 'Not specified' : unavailable}</p>
                </div>
              </div>
            </div>

            {/* Account info */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
              <h3 className="text-xs font-extrabold text-gray-400 uppercase tracking-widest">Account Details</h3>

              <div className="flex items-start gap-3">
                <div className="size-9 rounded-xl bg-green-50 flex items-center justify-center shrink-0">
                  <Calendar className="size-4 text-green-500" />
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Member Since</p>
                  <p className="text-sm font-semibold text-gray-800 mt-0.5">
                    {memberSince}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="size-9 rounded-xl bg-teal-50 flex items-center justify-center shrink-0">
                  <ShieldCheck className="size-4 text-teal-500" />
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Subscription</p>
                  <p className="text-sm font-semibold text-gray-800 mt-0.5 capitalize">active</p>
                  <p className="text-xs text-gray-400 mt-0.5">Expires Dec 7, 2027</p>
                </div>
              </div>

            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Groups Joined', value: profile?.groupsJoinedNumber ?? unavailable,       icon: Users,     bg: 'bg-orange-50', color: 'text-orange-500' },
              { label: 'Completed',     value: profile?.completedActivityNumber ?? unavailable, icon: Star,      bg: 'bg-amber-50',  color: 'text-amber-500' },
              { label: 'Activities',    value: profile?.activitiesNumber ?? unavailable,    icon: Activity,  bg: 'bg-orange-50',   color: 'text-orange-500' },
            ].map(({ label, value, icon: Icon, bg, color }) => (
              <div key={label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 text-center">
                <div className={`size-10 rounded-xl ${bg} flex items-center justify-center mx-auto mb-3`}>
                  <Icon className={`size-5 ${color}`} />
                </div>
                <p className="text-2xl font-extrabold text-gray-900">{value}</p>
                <p className="text-xs text-gray-400 font-medium mt-1">{label}</p>
              </div>
            ))}
          </div>

          {/* Group history */}
          {myGroups.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100">
                <h3 className="text-xs font-extrabold text-gray-400 uppercase tracking-widest">Group History</h3>
              </div>
              <div className="divide-y divide-gray-50">
                {myGroups.map(group => {
                  const activityName = allActivities.find(a => a.id === group.activityId)?.name ?? group.snapshot?.name ?? 'Unknown Activity';
                  const activityImage = allActivities.find(a => a.id === group.activityId)?.image ?? group.snapshot?.image;
                  const statusColors: Record<string, string> = {
                    confirmed: 'bg-green-50 text-green-600',
                    forming:   'bg-amber-50 text-amber-600',
                    completed: 'bg-blue-50 text-blue-600',
                    cancelled: 'bg-gray-100 text-gray-400',
                  };
                  return (
                    <div key={group.id} className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50/50 transition-colors">
                      {activityImage && (
                        <img
                          src={activityImage}
                          alt={activityName}
                          className="size-10 rounded-xl object-cover shrink-0"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-800 truncate">{activityName}</p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {new Date(group.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          {' · '}{group.members.length} members
                        </p>
                      </div>
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize shrink-0 ${statusColors[group.status] ?? 'bg-gray-100 text-gray-400'}`}>
                        {group.status}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
