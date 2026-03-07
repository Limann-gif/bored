import { Activity } from '../types';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Calendar, MapPin, Users, DollarSign } from 'lucide-react';
import { format } from 'date-fns';
import { useNavigate } from 'react-router';

interface ActivityCardProps {
  activity: Activity;
}

export function ActivityCard({ activity }: ActivityCardProps) {
  const navigate = useNavigate();

  return (
    <Card 
      className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
      onClick={() => navigate(`/activity/${activity.id}`)}
    >
      <div className="aspect-video relative overflow-hidden">
        <img
          src={activity.image}
          alt={activity.name}
          className="object-cover w-full h-full hover:scale-105 transition-transform duration-300"
        />
        <Badge className="absolute top-3 right-3 bg-white/90 text-gray-900">
          ${activity.price}
        </Badge>
      </div>
      <CardContent className="p-4">
        <div className="mb-2">
          <h3 className="font-semibold mb-1">{activity.name}</h3>
          <p className="text-sm text-gray-600 line-clamp-2">{activity.description}</p>
        </div>
        
        <div className="flex flex-wrap gap-1 mb-3">
          {activity.vibes.map((vibe) => (
            <Badge key={vibe} variant="secondary" className="text-xs">
              {vibe}
            </Badge>
          ))}
        </div>
        
        <div className="space-y-1 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <Calendar className="size-4" />
            <span>{format(activity.date, 'MMM d, yyyy')}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="size-4" />
            <span>{activity.location}</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="size-4" />
            <span>{activity.groupSize.min}-{activity.groupSize.max} people per group</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
