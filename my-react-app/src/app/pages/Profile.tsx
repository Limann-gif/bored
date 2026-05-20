import { useMemo } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { Sidebar } from '../components/Sidebar';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Separator } from '../components/ui/separator';
import {
  Calendar, MapPin, Users, CheckCircle2, Clock,
  Star, Trophy, Zap, Activity,
} from 'lucide-react';
import { format } from 'date-fns';

export default function Profile() {
  const { user } = useAuth();
  const { getUserGroups, activities } = useApp();
  const navigate = useNavigate();

  const myGroups = getUserGroups();

  const groupsWithActivity = useMemo(() => {
    return myGroups.map(group => ({
      ...group,
      activity: activities.find(a => a.id === group.activityId),
    }));
  }, [myGroups, activities]);

  const upcomingGroups = groupsWithActivity.filter(
    g => g.activity && new Date(g.activityDate) >= new Date()
  );

  const pastGroups = groupsWithActivity.filter(
    g => g.activity && new Date(g.activityDate) < new Date()
  );

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Please log in to view your profile.</p>
      </div>
    );
  }

  const firstName = user.name.split(' ')[0];
  const initials = user.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const isPro = user.subscriptionStatus === 'active';

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />

      <main className="flex-1 overflow-y-auto">
        {/* Hero banner */}
        <div className="h-36 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500" />

        <div className="px-8 pb-12 -mt-12">
          {/* Avatar + name row */}
          <div className="flex items-end gap-5 mb-6">
            <div className="size-24 rounded-2xl bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center text-white font-extrabold text-3xl ring-4 ring-white shadow-lg shrink-0">
              {initials}
            </div>
            <div className="mb-2 flex-1 min-w-0">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl font-extrabold text-gray-900">{user.name}</h1>
                {isPro ? (
                  <Badge className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white border-0 text-xs font-bold px-3 py-1 flex items-center gap-1">
                    <Star className="size-3 fill-white" /> Gold Member
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="text-xs">Free Tier</Badge>
                )}
              </div>
              <p className="text-sm text-gray-500 mt-0.5">{user.email}</p>
              {user.location && (
                <p className="text-sm text-gray-400 flex items-center gap-1 mt-0.5">
                  <MapPin className="size-3.5" /> {user.location.address}
                </p>
              )}
            </div>
            {!isPro && (
              <Button
                onClick={() => navigate('/')}
                className="mb-2 shrink-0 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white border-0"
              >
                <Zap className="size-4 mr-1.5 fill-white" />
                Go Pro
              </Button>
            )}
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <StatCard
              icon={<Trophy className="size-5 text-yellow-500" />}
              value={pastGroups.length}
              label="Activities Done"
            />
            <StatCard
              icon={<Users className="size-5 text-purple-500" />}
              value={myGroups.length}
              label="Groups Joined"
            />
            <StatCard
              icon={<Clock className="size-5 text-pink-500" />}
              value={upcomingGroups.length}
              label="Upcoming"
            />
          </div>

          <Separator className="mb-8" />

          {/* Upcoming events */}
          <Section
            title="Upcoming Events"
            icon={<Clock className="size-5 text-pink-500" />}
            empty={upcomingGroups.length === 0}
            emptyMessage="No upcoming events — browse activities to join one!"
            emptyAction={
              <Button variant="outline" size="sm" onClick={() => navigate('/activities')}>
                Explore Activities
              </Button>
            }
          >
            <div className="grid gap-4">
              {upcomingGroups.map(({ activity, ...group }) =>
                activity ? (
                  <EventRow key={group.id} activity={activity} group={group} userId={user.id} upcoming />
                ) : null
              )}
            </div>
          </Section>

          {pastGroups.length > 0 && (
            <>
              <Separator className="my-8" />

              {/* Past events */}
              <Section
                title="Past Events"
                icon={<Activity className="size-5 text-gray-400" />}
              >
                <div className="grid gap-3">
                  {pastGroups.map(({ activity, ...group }) =>
                    activity ? (
                      <EventRow key={group.id} activity={activity} group={group} userId={user.id} />
                    ) : null
                  )}
                </div>
              </Section>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

/* ── helpers ── */

function StatCard({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: number;
  label: string;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 flex items-center gap-4 shadow-sm">
      <div className="size-10 rounded-xl bg-gray-50 flex items-center justify-center shrink-0">
        {icon}
      </div>
      <div>
        <p className="text-2xl font-extrabold text-gray-900 leading-none">{value}</p>
        <p className="text-xs text-gray-400 mt-1">{label}</p>
      </div>
    </div>
  );
}

function Section({
  title,
  icon,
  children,
  empty,
  emptyMessage,
  emptyAction,
}: {
  title: string;
  icon: React.ReactNode;
  children?: React.ReactNode;
  empty?: boolean;
  emptyMessage?: string;
  emptyAction?: React.ReactNode;
}) {
  return (
    <div className="mb-2">
      <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2 mb-4">
        {icon} {title}
      </h2>
      {empty ? (
        <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-8 text-center">
          <p className="text-sm text-gray-400 mb-3">{emptyMessage}</p>
          {emptyAction}
        </div>
      ) : (
        children
      )}
    </div>
  );
}

function EventRow({
  activity,
  group,
  userId,
  upcoming = false,
}: {
  activity: { name: string; category: string; image: string; description: string };
  group: {
    id: string;
    activityDate: Date;
    meetingPoint: { address: string };
    members: { userId: string; name: string }[];
    status: string;
  };
  userId: string;
  upcoming?: boolean;
}) {
  const others = group.members.filter(m => m.userId !== userId);

  return (
    <div
      className={`bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex gap-0 ${
        upcoming ? '' : 'opacity-75'
      }`}
    >
      {/* Thumbnail */}
      <div className="w-28 shrink-0 hidden sm:block">
        <img
          src={(activity as { image: string }).image}
          alt={activity.name}
          className="w-full h-full object-cover"
        />
      </div>

      <div className="flex-1 p-4 min-w-0">
        <div className="flex items-start justify-between gap-2 mb-1">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-pink-500">
              {activity.category}
            </span>
            <h3 className="font-bold text-gray-900 text-sm leading-tight">{activity.name}</h3>
          </div>
          {upcoming ? (
            <Badge className="bg-green-100 text-green-700 border-0 text-[10px] font-bold shrink-0 flex items-center gap-1">
              <CheckCircle2 className="size-3" /> Confirmed
            </Badge>
          ) : (
            <Badge variant="secondary" className="text-[10px] shrink-0">
              Done
            </Badge>
          )}
        </div>

        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500 mt-2">
          <span className="flex items-center gap-1">
            <Calendar className="size-3.5" />
            {format(new Date(group.activityDate), 'EEE, MMM d, yyyy')}
          </span>
          <span className="flex items-center gap-1">
            <MapPin className="size-3.5" />
            {group.meetingPoint.address}
          </span>
        </div>

        {others.length > 0 && (
          <div className="flex items-center gap-1.5 mt-3">
            <Users className="size-3.5 text-gray-400 shrink-0" />
            <div className="flex -space-x-1.5">
              {others.slice(0, 4).map(m => (
                <div
                  key={m.userId}
                  title={m.name}
                  className="size-6 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white text-[9px] font-bold ring-1 ring-white"
                >
                  {m.name.charAt(0)}
                </div>
              ))}
              {others.length > 4 && (
                <div className="size-6 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-[9px] font-bold ring-1 ring-white">
                  +{others.length - 4}
                </div>
              )}
            </div>
            <span className="text-xs text-gray-400 ml-1">
              {others.slice(0, 2).map(m => m.name.split(' ')[0]).join(', ')}
              {others.length > 2 ? ` & ${others.length - 2} more` : ''}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
