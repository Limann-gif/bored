import { useMemo } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { Header } from '../components/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Separator } from '../components/ui/separator';
import { Calendar, MapPin, Users, CheckCircle2, Clock, XCircle, Mail, Gift, Sparkles, PartyPopper, CreditCard } from 'lucide-react';
import { format } from 'date-fns';
import type { Activity, Group } from '../types';

const AVATAR_GRADIENTS = [
  'from-purple-400 to-pink-400',
  'from-blue-400 to-cyan-400',
  'from-orange-400 to-amber-400',
  'from-green-400 to-teal-400',
  'from-rose-400 to-pink-500',
  'from-indigo-400 to-violet-400',
];

function MemberAvatar({ name, index, isYou }: { name: string; index: number; isYou: boolean }) {
  const gradient = AVATAR_GRADIENTS[index % AVATAR_GRADIENTS.length];
  return (
    <div
      title={name + (isYou ? ' (you)' : '')}
      className={`size-9 rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center text-white text-sm font-bold shadow-sm ring-2 ring-white`}
    >
      {name.charAt(0)}
    </div>
  );
}

function PastEventRow({
  activity,
  group,
  userId,
}: {
  activity: Activity;
  group: Omit<Group, 'activity'>;
  userId: string;
}) {
  return (
    <div className="flex items-center gap-4 bg-white border border-gray-100 rounded-2xl p-4 hover:shadow-md transition-all duration-200">
      <div className="relative shrink-0">
        <img
          src={activity.image}
          alt={activity.name}
          className="size-16 rounded-xl object-cover opacity-70"
        />
        <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-purple-500/10 to-pink-500/10" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-gray-700 truncate">{activity.name}</p>
        <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
          <span className="flex items-center gap-1">
            <Calendar className="size-3" />
            {format(new Date(group.activityDate), 'MMM d, yyyy')}
          </span>
          <span className="flex items-center gap-1">
            <MapPin className="size-3" />
            {group.meetingPoint.address}
          </span>
        </div>
      </div>
      <div className="flex -space-x-2.5 shrink-0">
        {group.members.slice(0, 4).map((member, i) => (
          <MemberAvatar
            key={member.userId}
            name={member.name}
            index={i}
            isYou={member.userId === userId}
          />
        ))}
        {group.members.length > 4 && (
          <div className="size-9 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500 ring-2 ring-white">
            +{group.members.length - 4}
          </div>
        )}
      </div>
      <CheckCircle2 className="size-5 text-gray-300 shrink-0" />
    </div>
  );
}

export default function MyGroups() {
  const { user } = useAuth();
  const { getUserGroups, activities, groupBookings } = useApp();
  const navigate = useNavigate();

  const myGroups = getUserGroups();

  const myGroupBookings = groupBookings.filter(b =>
    b.userId === user?.id ||
    b.friends.some(f => f.email.toLowerCase() === user?.email.toLowerCase())
  );

  const groupsWithActivity = useMemo(() => {
    return myGroups.map(group => {
      const found = activities.find(a => a.id === group.activityId);
      if (found) return { ...group, activity: found };
      // Fallback: build a minimal display object from the stored snapshot
      if (group.snapshot) {
        const date = new Date(group.activityDate);
        return {
          ...group,
          activity: {
            id: group.activityId,
            name: group.snapshot.name,
            image: group.snapshot.image,
            description: group.snapshot.description,
            location: group.snapshot.location,
            price: group.snapshot.price,
            date,
            activityDate: date,
            category: '',
            vibes: [] as string[],
            capacity: 0,
            groupSize: { min: 0, max: 0 },
          },
        };
      }
      return { ...group, activity: undefined };
    });
  }, [myGroups, activities]);

  const upcomingGroups = groupsWithActivity.filter(g =>
    g.activity && new Date(g.activityDate) >= new Date()
  );

  const pastGroups = groupsWithActivity.filter(g =>
    g.activity && new Date(g.activityDate) < new Date()
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 via-white to-gray-50">
      <Header />

      {/* Hero header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-purple-600 via-violet-600 to-pink-500 text-white">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-4 left-10 size-32 rounded-full bg-white/30 blur-3xl" />
          <div className="absolute bottom-2 right-16 size-40 rounded-full bg-pink-300/40 blur-3xl" />
          <div className="absolute top-6 right-1/3 size-24 rounded-full bg-violet-300/30 blur-2xl" />
        </div>
        <div className="relative container mx-auto px-4 py-10">
          <div className="flex items-center gap-3 mb-2">
            <Sparkles className="size-7 text-yellow-300" />
            <h1 className="text-4xl font-extrabold tracking-tight">My Adventures</h1>
          </div>
          <p className="text-purple-100 text-lg max-w-md">
            Your upcoming activities, group bookings, and past memories — all in one place.
          </p>
          <div className="flex items-center gap-6 mt-6">
            <div className="text-center">
              <p className="text-3xl font-bold">{upcomingGroups.length}</p>
              <p className="text-xs text-purple-200 uppercase tracking-wider mt-0.5">Upcoming</p>
            </div>
            <div className="w-px h-10 bg-white/20" />
            <div className="text-center">
              <p className="text-3xl font-bold">{pastGroups.length}</p>
              <p className="text-xs text-purple-200 uppercase tracking-wider mt-0.5">Completed</p>
            </div>
            {myGroupBookings.length > 0 && (
              <>
                <div className="w-px h-10 bg-white/20" />
                <div className="text-center">
                  <p className="text-3xl font-bold">{myGroupBookings.length}</p>
                  <p className="text-xs text-purple-200 uppercase tracking-wider mt-0.5">Bookings</p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-10 space-y-12">

        {/* My Group Booking List */}
        {myGroupBookings.length > 0 && (
          <section>
            <div className="flex items-center gap-3 mb-5">
              <div className="p-2 rounded-xl bg-pink-100">
                <Gift className="size-5 text-pink-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Group Bookings</h2>
              <span className="ml-auto text-sm font-semibold text-pink-500 bg-pink-50 px-3 py-1 rounded-full">
                {myGroupBookings.length} booking{myGroupBookings.length !== 1 ? 's' : ''}
              </span>
            </div>
            <div className="grid gap-4">
              {myGroupBookings.map(booking => {
                const activity = activities.find(a => a.id === booking.activityId);
                if (!activity) return null;
                const totalPeople = booking.friends.length + 1;
                return (
                  <Card key={booking.id} className="overflow-hidden border-0 shadow-md hover:shadow-lg transition-shadow duration-200">
                    <div className="h-1 bg-gradient-to-r from-purple-500 via-violet-500 to-pink-500" />
                    <div className="flex items-start gap-5 p-5">
                      <div className="relative shrink-0">
                        <img
                          src={activity.image}
                          alt={activity.name}
                          className="size-20 rounded-2xl object-cover hover:opacity-90 transition-opacity"
                        />
                        <div className="absolute -bottom-1.5 -right-1.5 bg-white rounded-full p-1 shadow">
                          {booking.bookingType === 'invite' ? (
                            <Mail className="size-3.5 text-purple-500" />
                          ) : (
                            <Gift className="size-3.5 text-pink-500" />
                          )}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0 space-y-3">
                        <div className="flex items-start justify-between gap-2 flex-wrap">
                          <div>
                            <p className="font-extrabold text-gray-900 text-lg">{activity.name}</p>
                            <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                              <span className="flex items-center gap-1">
                                <Calendar className="size-3" />
                                {format(new Date(activity.date), 'EEE, MMM d, yyyy')}
                              </span>
                              <span className="flex items-center gap-1">
                                <MapPin className="size-3" />
                                {activity.location}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            {booking.bookingType === 'invite' ? (
                              <span className="flex items-center gap-1 text-[11px] font-bold bg-purple-100 text-purple-600 px-2.5 py-1 rounded-full">
                                <Mail className="size-3" /> Invite
                              </span>
                            ) : (
                              <span className="flex items-center gap-1 text-[11px] font-bold bg-pink-100 text-pink-500 px-2.5 py-1 rounded-full">
                                <Gift className="size-3" /> Surprise
                              </span>
                            )}
                            <span className="text-[11px] font-bold bg-emerald-50 text-emerald-600 px-2.5 py-1 rounded-full border border-emerald-100">
                              ${booking.totalPrice} paid
                            </span>
                          </div>
                        </div>

                        <Separator />

                        <div>
                          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                            Group ({totalPeople} people)
                          </p>
                          <div className="flex flex-wrap gap-2">
                            <div className="flex items-center gap-1.5 bg-orange-50 border border-orange-100 rounded-full px-3 py-1.5">
                              <div className="size-4 rounded-full bg-gradient-to-br from-orange-400 to-pink-500 shrink-0" />
                              <span className="text-xs font-semibold text-gray-700">{user?.name} (you)</span>
                            </div>
                            {booking.friends.map((f, i) => (
                              <div key={i} className="flex items-center gap-1.5 bg-gray-50 border border-gray-100 rounded-full px-3 py-1.5">
                                <div className={`size-4 rounded-full bg-gradient-to-br ${AVATAR_GRADIENTS[(i + 1) % AVATAR_GRADIENTS.length]} shrink-0`} />
                                <span className="text-xs font-semibold text-gray-700">{f.name}</span>
                                <span className="text-[10px] text-gray-400">{f.email}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </section>
        )}

        {myGroups.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="relative mb-6">
              <div className="size-24 rounded-full bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
                <PartyPopper className="size-12 text-purple-400" />
              </div>
              <div className="absolute -top-1 -right-1 size-8 rounded-full bg-yellow-300 flex items-center justify-center text-lg">
                ✨
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">No adventures yet!</h2>
            <p className="text-gray-500 mb-8 max-w-sm">
              Join an activity to get matched with awesome people nearby and start making memories.
            </p>
            <Button
              size="lg"
              onClick={() => navigate('/activities')}
              className="bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 text-white shadow-lg shadow-purple-200 px-8"
            >
              <Sparkles className="size-4 mr-2" />
              Browse Activities
            </Button>
          </div>
        ) : (
          <div className="space-y-12">

            {/* Upcoming Groups */}
            {upcomingGroups.length > 0 && (
              <section>
                <div className="flex items-center gap-3 mb-5">
                  <div className="p-2 rounded-xl bg-violet-100">
                    <Clock className="size-5 text-violet-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">Upcoming Activities</h2>
                  <span className="ml-auto text-sm font-semibold text-violet-500 bg-violet-50 px-3 py-1 rounded-full">
                    {upcomingGroups.length} event{upcomingGroups.length !== 1 ? 's' : ''}
                  </span>
                </div>
                <div className="grid gap-6">
                  {upcomingGroups.map(({ activity, ...group }) => (
                    activity && (
                      <Card key={group.id} className="overflow-hidden border-0 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5">
                        <div className="grid md:grid-cols-[320px_1fr] gap-0">
                          <div className="aspect-video md:aspect-auto relative">
                            <img
                              src={activity.image}
                              alt={activity.name}
                              className="object-cover w-full h-full"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent md:bg-gradient-to-r md:from-transparent md:to-black/10" />
                          </div>

                          <div>
                            <CardHeader>
                              <div className="flex items-start justify-between">
                                <div>
                                  <CardTitle className="text-2xl mb-2 text-gray-900">{activity.name}</CardTitle>
                                  <CardDescription className="text-gray-500">{activity.description}</CardDescription>
                                </div>
                                <div className="flex flex-col items-end gap-1.5 shrink-0 ml-2">
                                  {group.status === 'booked' ? (
                                    <Badge className="bg-amber-400 hover:bg-amber-500 text-white shadow-sm">
                                      <CreditCard className="size-3 mr-1" />
                                      Booked
                                    </Badge>
                                  ) : (
                                    <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm">
                                      <CheckCircle2 className="size-3 mr-1" />
                                      Confirmed
                                    </Badge>
                                  )}
                                  {group.bookingType === 'invite' && (
                                    <span className="flex items-center gap-1 text-[11px] font-bold bg-purple-100 text-purple-600 px-2.5 py-1 rounded-full">
                                      <Mail className="size-3" /> Group Invite
                                    </span>
                                  )}
                                  {group.bookingType === 'surprise' && (
                                    <span className="flex items-center gap-1 text-[11px] font-bold bg-pink-100 text-pink-500 px-2.5 py-1 rounded-full">
                                      <Gift className="size-3" /> Surprise
                                    </span>
                                  )}
                                </div>
                              </div>
                            </CardHeader>

                            <CardContent className="space-y-5">
                              <div className="grid md:grid-cols-2 gap-4">
                                <div className="flex items-start gap-3 bg-purple-50 rounded-xl p-3">
                                  <Calendar className="size-5 text-purple-500 mt-0.5 shrink-0" />
                                  <div>
                                    <p className="text-xs font-bold text-purple-400 uppercase tracking-wider">Date</p>
                                    <p className="text-sm font-semibold text-gray-800 mt-0.5">
                                      {format(group.activityDate, 'EEEE, MMM d, yyyy')}
                                    </p>
                                  </div>
                                </div>

                                <div className="flex items-start gap-3 bg-pink-50 rounded-xl p-3">
                                  <MapPin className="size-5 text-pink-500 mt-0.5 shrink-0" />
                                  <div>
                                    <p className="text-xs font-bold text-pink-400 uppercase tracking-wider">Meeting Point</p>
                                    <p className="text-sm font-semibold text-gray-800 mt-0.5">
                                      {group.meetingPoint.address}
                                    </p>
                                  </div>
                                </div>
                              </div>

                              <Separator />

                              <div>
                                <div className="flex items-center gap-2 mb-3">
                                  <Users className="size-4 text-gray-500" />
                                  <p className="font-semibold text-gray-700 text-sm">
                                    Your Group
                                    <span className="ml-1.5 text-xs font-normal text-gray-400">({group.members.length} people)</span>
                                  </p>
                                </div>
                                {group.status === 'booked' ? (
                                  <div className="flex items-center gap-2">
                                    <div className="flex -space-x-2.5">
                                      {group.members.slice(0, 6).map((member, i) => (
                                        <MemberAvatar
                                          key={member.userId}
                                          name={member.name}
                                          index={i}
                                          isYou={member.userId === user?.id}
                                        />
                                      ))}
                                      {group.members.length > 6 && (
                                        <div className="size-9 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500 ring-2 ring-white">
                                          +{group.members.length - 6}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                ) : (
                                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                    {group.members.map((member, i) => (
                                      <div
                                        key={member.userId}
                                        className="flex items-center gap-2.5 p-2.5 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors"
                                      >
                                        <MemberAvatar
                                          name={member.name}
                                          index={i}
                                          isYou={member.userId === user?.id}
                                        />
                                        <div className="flex-1 min-w-0">
                                          <p className="text-sm font-semibold truncate text-gray-800">
                                            {member.name}
                                          </p>
                                          {member.userId === user?.id && (
                                            <p className="text-[10px] text-purple-400 font-medium">you</p>
                                          )}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>

                              <Separator />

                              {group.status === 'booked' ? (
                                <div className="flex items-center justify-between bg-amber-50 border border-amber-100 rounded-2xl px-4 py-3">
                                  <div>
                                    <p className="text-sm font-bold text-amber-700">Payment pending</p>
                                    <p className="text-xs text-amber-500 mt-0.5">Complete payment to confirm your spot</p>
                                  </div>
                                  <Button
                                    size="sm"
                                    onClick={() => navigate(`/payment/${group.id}`)}
                                    className="bg-gradient-to-r from-pink-500 to-purple-600 text-white hover:opacity-90 shadow-sm shrink-0"
                                  >
                                    <CreditCard className="size-4 mr-1.5" />
                                    Make Payment
                                  </Button>
                                </div>
                              ) : (
                                <div className="flex items-center justify-between bg-red-50 border border-red-100 rounded-2xl px-4 py-3">
                                  <div>
                                    <p className="text-sm font-bold text-red-700">Can't make it?</p>
                                    <p className="text-xs text-red-400 mt-0.5">Let your group know — cancel at least 2 weeks before</p>
                                  </div>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => navigate(`/cancel-event/${group.id}`)}
                                    className="border-red-200 text-red-500 hover:bg-red-100 hover:text-red-700 hover:border-red-300 shrink-0"
                                  >
                                    <XCircle className="size-4 mr-1.5" />
                                    Cancel
                                  </Button>
                                </div>
                              )}
                            </CardContent>
                          </div>
                        </div>
                      </Card>
                    )
                  ))}
                </div>
              </section>
            )}

            {/* Past Groups */}
            {pastGroups.length > 0 && (
              <section>
                <div className="flex items-center gap-3 mb-5">
                  <div className="p-2 rounded-xl bg-gray-100">
                    <CheckCircle2 className="size-5 text-gray-500" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-700">Past Activities</h2>
                  <span className="ml-auto text-sm font-semibold text-gray-400 bg-gray-100 px-3 py-1 rounded-full">
                    {pastGroups.length} completed
                  </span>
                </div>
                <div className="grid gap-3">
                  {pastGroups.map(({ activity, ...group }) =>
                    activity ? (
                      <PastEventRow key={group.id} activity={activity} group={group} userId={user?.id ?? ''} />
                    ) : null
                  )}
                </div>
              </section>
            )}

          </div>
        )}
      </div>
    </div>
  );
}
