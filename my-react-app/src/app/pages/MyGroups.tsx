import { useMemo } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { Header } from '../components/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Separator } from '../components/ui/separator';
import { Calendar, MapPin, Users, CheckCircle2, Clock, XCircle, Mail, Gift } from 'lucide-react';
import { format } from 'date-fns';
import type { Activity, Group, GroupBookingRecord } from '../types';

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
    <div className="flex items-center gap-4 bg-white border border-gray-100 rounded-xl p-4 hover:shadow-sm transition-shadow">
      <img
        src={activity.image}
        alt={activity.name}
        className="size-16 rounded-lg object-cover shrink-0 opacity-80"
      />
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-gray-800 truncate">{activity.name}</p>
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
      <div className="flex -space-x-2 shrink-0">
        {group.members.slice(0, 4).map(member => (
          <div
            key={member.userId}
            title={member.name + (member.userId === userId ? ' (you)' : '')}
            className="size-8 rounded-full border-2 border-white bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white text-xs font-semibold"
          >
            {member.name.charAt(0)}
          </div>
        ))}
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

  const groupsWithActivity = useMemo(() => {
    return myGroups.map(group => ({
      ...group,
      activity: activities.find(a => a.id === group.activityId),
    }));
  }, [myGroups, activities]);

  const upcomingGroups = groupsWithActivity.filter(g => 
    g.activity && new Date(g.activityDate) >= new Date()
  );

  const pastGroups = groupsWithActivity.filter(g => 
    g.activity && new Date(g.activityDate) < new Date()
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">My List</h1>
          <p className="text-lg text-gray-600">
            Your upcoming activities and past adventures
          </p>
        </div>

        {/* My Group Booking List */}
        {groupBookings.length > 0 && (
          <div className="mb-10">
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
              <Users className="size-6" />
              My Group Booking List
            </h2>
            <div className="grid gap-4">
              {groupBookings.map(booking => {
                const activity = activities.find(a => a.id === booking.activityId);
                if (!activity) return null;
                const totalPeople = booking.friends.length + 1;
                return (
                  <Card key={booking.id} className="overflow-hidden">
                    <div className="flex items-start gap-4 p-5">
                      <img
                        src={activity.image}
                        alt={activity.name}
                        className="size-16 rounded-xl object-cover shrink-0"
                      />
                      <div className="flex-1 min-w-0 space-y-3">
                        <div className="flex items-start justify-between gap-2 flex-wrap">
                          <div>
                            <p className="font-extrabold text-gray-900">{activity.name}</p>
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
                            <span className="text-[11px] font-bold bg-green-100 text-green-600 px-2.5 py-1 rounded-full">
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
                            {/* Current user */}
                            <div className="flex items-center gap-1.5 bg-gray-50 rounded-full px-3 py-1.5">
                              <div className="size-4 rounded-full bg-gradient-to-br from-orange-400 to-pink-500 shrink-0" />
                              <span className="text-xs font-semibold text-gray-700">{user?.name} (you)</span>
                            </div>
                            {/* Friends */}
                            {booking.friends.map((f, i) => (
                              <div key={i} className="flex items-center gap-1.5 bg-gray-50 rounded-full px-3 py-1.5">
                                <div className="size-4 rounded-full bg-gradient-to-br from-purple-400 to-indigo-500 shrink-0" />
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
          </div>
        )}

        {myGroups.length === 0 ? (
          <Card className="text-center py-16">
            <CardContent>
              <Users className="size-16 mx-auto text-gray-400 mb-4" />
              <h2 className="text-2xl font-semibold mb-2">No selected activities yet</h2>
              <p className="text-gray-600 mb-6">
                Join an activity to get matched with awesome people nearby
              </p>
              <Button onClick={() => navigate('/activities')}>
                Browse Activities
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-8">
            {/* Upcoming Groups */}
            {upcomingGroups.length > 0 && (
              <div>
                <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                  <Clock className="size-6" />
                  Upcoming Activities
                </h2>
                <div className="grid gap-6">
                  {upcomingGroups.map(({ activity, ...group }) => (
                    activity && (
                      <Card key={group.id} className="overflow-hidden">
                        <div className="grid md:grid-cols-[300px_1fr] gap-0">
                          <div className="aspect-video md:aspect-auto">
                            <img
                              src={activity.image}
                              alt={activity.name}
                              className="object-cover w-full h-full"
                            />
                          </div>
                          
                          <div>
                            <CardHeader>
                              <div className="flex items-start justify-between">
                                <div>
                                  <CardTitle className="text-2xl mb-2">{activity.name}</CardTitle>
                                  <CardDescription>{activity.description}</CardDescription>
                                </div>
                                <Badge className="bg-green-600">
                                  <CheckCircle2 className="size-3 mr-1" />
                                  Confirmed
                                </Badge>
                              </div>
                            </CardHeader>
                            
                            <CardContent className="space-y-4">
                              <div className="grid md:grid-cols-2 gap-4">
                                <div className="flex items-start gap-3">
                                  <Calendar className="size-5 text-gray-600 mt-0.5" />
                                  <div>
                                    <p className="text-sm font-medium">Date & Time</p>
                                    <p className="text-sm text-gray-600">
                                      {format(group.activityDate, 'EEEE, MMM d, yyyy')}
                                    </p>
                                  </div>
                                </div>

                                <div className="flex items-start gap-3">
                                  <MapPin className="size-5 text-gray-600 mt-0.5" />
                                  <div>
                                    <p className="text-sm font-medium">Meeting Point</p>
                                    <p className="text-sm text-gray-600">
                                      {group.meetingPoint.address}
                                    </p>
                                  </div>
                                </div>
                              </div>

                              <Separator />

                              <div>
                                <div className="flex items-center gap-2 mb-3">
                                  <Users className="size-5 text-gray-600" />
                                  <p className="font-medium">Your Group ({group.members.length} people)</p>
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                  {group.members.map((member) => (
                                    <div
                                      key={member.userId}
                                      className="flex items-center gap-2 p-2 rounded-lg bg-gray-50"
                                    >
                                      <div className="size-8 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white font-semibold">
                                        {member.name.charAt(0)}
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium truncate">
                                          {member.name}
                                          {member.userId === user?.id && (
                                            <span className="text-xs text-gray-500 ml-1">(you)</span>
                                          )}
                                        </p>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              <Separator />

                              {/* Cancel event card */}
                              <div className="flex items-center justify-between bg-red-50 border border-red-100 rounded-xl px-4 py-3">
                                <div>
                                  <p className="text-sm font-semibold text-red-700">Cancel Event</p>
                                  <p className="text-xs text-red-400 mt-0.5">Can't make it? Let your group know. Remember to cancel, two weeks before the event</p>
                                </div>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => navigate(`/cancel-event/${group.id}`)}
                                  className="border-red-300 text-red-600 hover:bg-red-100 hover:text-red-700 hover:border-red-400"
                                >
                                  <XCircle className="size-4 mr-1.5" />
                                  Cancel
                                </Button>
                              </div>
                            </CardContent>
                          </div>
                        </div>
                      </Card>
                    )
                  ))}
                </div>
              </div>
            )}

            {/* Past Groups */}
            {pastGroups.length > 0 && (
              <div>
                <h2 className="text-2xl font-semibold mb-4">Past Activities</h2>
                <div className="grid gap-3">
                  {pastGroups.map(({ activity, ...group }) =>
                    activity ? (
                      <PastEventRow key={group.id} activity={activity} group={group} userId={user?.id ?? ''} />
                    ) : null
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
