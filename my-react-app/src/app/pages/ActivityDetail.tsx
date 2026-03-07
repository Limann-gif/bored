import { useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { Header } from '../components/Header';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Calendar, MapPin, Users, DollarSign, Sparkles } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

export default function ActivityDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { activities, selectActivity } = useApp();
  const [location, setLocation] = useState(user?.location?.address || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const activity = activities.find(a => a.id === id);

  if (!activity) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">Activity not found</h1>
          <Button onClick={() => navigate('/activities')}>
            Back to Activities
          </Button>
        </div>
      </div>
    );
  }

  const handleJoinActivity = async () => {
    if (!location.trim()) {
      toast.error('Please enter your location');
      return;
    }

    setIsSubmitting(true);

    // Simulate geocoding - in real app, use Google Maps API
    const mockLat = 37.7749 + (Math.random() - 0.5) * 0.1;
    const mockLng = -122.4194 + (Math.random() - 0.5) * 0.1;

    // Small delay to simulate processing
    await new Promise(resolve => setTimeout(resolve, 1000));

    selectActivity(activity.id, {
      lat: mockLat,
      lng: mockLng,
      address: location,
    });

    setIsSubmitting(false);
    
    toast.success('You\'ve been matched with a group!', {
      description: 'Check "My Groups" to see your new crew',
    });

    navigate('/my-groups');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <Button variant="ghost" onClick={() => navigate('/activities')} className="mb-4">
          ← Back to Activities
        </Button>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Image and Basic Info */}
          <div>
            <div className="aspect-video rounded-lg overflow-hidden mb-4">
              <img
                src={activity.image}
                alt={activity.name}
                className="object-cover w-full h-full"
              />
            </div>
            
            <div className="space-y-4">
              <div>
                <h1 className="text-3xl font-bold mb-2">{activity.name}</h1>
                <Badge className="mb-4">{activity.category}</Badge>
                <p className="text-gray-700">{activity.description}</p>
              </div>

              <div className="flex flex-wrap gap-2">
                {activity.vibes.map((vibe) => (
                  <Badge key={vibe} variant="secondary">
                    {vibe}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          {/* Booking Card */}
          <div>
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Join This Activity</span>
                  <span className="text-2xl text-purple-600">${activity.price}</span>
                </CardTitle>
                <CardDescription>
                  Select this activity and we'll match you with a group
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Activity Details */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Calendar className="size-5 text-gray-600" />
                    <div>
                      <p className="text-sm font-medium">Date & Time</p>
                      <p className="text-sm text-gray-600">{format(activity.date, 'EEEE, MMMM d, yyyy')}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <MapPin className="size-5 text-gray-600" />
                    <div>
                      <p className="text-sm font-medium">Location</p>
                      <p className="text-sm text-gray-600">{activity.location}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Users className="size-5 text-gray-600" />
                    <div>
                      <p className="text-sm font-medium">Group Size</p>
                      <p className="text-sm text-gray-600">
                        {activity.groupSize.min}-{activity.groupSize.max} people per group
                      </p>
                    </div>
                  </div>
                </div>

                {/* Location Input */}
                <div className="space-y-2">
                  <Label htmlFor="location">Your Starting Location</Label>
                  <Input
                    id="location"
                    type="text"
                    placeholder="Enter your address or neighborhood"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  />
                  <p className="text-xs text-gray-500">
                    We'll use this to find people nearby and suggest a central meeting point
                  </p>
                </div>

                {/* How It Works */}
                <Card className="bg-purple-50 border-purple-200">
                  <CardContent className="pt-4">
                    <div className="flex items-start gap-3">
                      <Sparkles className="size-5 text-purple-600 mt-0.5" />
                      <div className="space-y-2 text-sm">
                        <p className="font-medium">What happens next:</p>
                        <ol className="list-decimal list-inside space-y-1 text-gray-700">
                          <li>We match you with {activity.groupSize.min}-{activity.groupSize.max} people nearby</li>
                          <li>You'll meet a fresh group (never the same people twice!)</li>
                          <li>We calculate the most central meeting point</li>
                          <li>Show up and have fun!</li>
                        </ol>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Button 
                  className="w-full" 
                  size="lg"
                  onClick={handleJoinActivity}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Finding your group...' : 'Join Activity'}
                </Button>

                <p className="text-xs text-center text-gray-500">
                  Included in your subscription • No additional fees
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
