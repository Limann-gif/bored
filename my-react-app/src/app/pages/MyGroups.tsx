import { useMemo } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { Header } from '../components/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Separator } from '../components/ui/separator';
import { Calendar, MapPin, Users, CheckCircle2, Clock, XCircle } from 'lucide-react';
import { format } from 'date-fns';

export default function MyGroups() {
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
          <h1 className="text-4xl font-bold mb-2">My Groups</h1>
          <p className="text-lg text-gray-600">
            Your upcoming activities and past adventures
          </p>
        </div>

        {myGroups.length === 0 ? (
          <Card className="text-center py-16">
            <CardContent>
              <Users className="size-16 mx-auto text-gray-400 mb-4" />
              <h2 className="text-2xl font-semibold mb-2">No groups yet</h2>
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
                                  <p className="text-xs text-red-400 mt-0.5">Can't make it? Let your group know.</p>
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
                <div className="grid gap-4">
                  {pastGroups.map(({ activity, ...group }) => (
                    activity && (
                      <Card key={group.id} className="opacity-75">
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <div>
                              <CardTitle>{activity.name}</CardTitle>
                              <CardDescription>
                                {format(group.activityDate, 'MMMM d, yyyy')}
                              </CardDescription>
                            </div>
                            <Badge variant="secondary">Completed</Badge>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-gray-600">
                            You met with {group.members.length} people at {group.meetingPoint.address}
                          </p>
                        </CardContent>
                      </Card>
                    )
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
