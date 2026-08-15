import { Activity } from '../types';
import { MapPin, Users, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { useNavigate } from 'react-router';

interface ActivityCardProps {
  activity: Activity;
  signups?: number;
}

export function ActivityCard({ activity, signups = 0 }: ActivityCardProps) {
  const navigate = useNavigate();
  const remainingSlots = Math.max(0, activity.capacity - signups);

  return (
    <div
      className="rounded-2xl overflow-hidden bg-white shadow-sm border border-gray-100 cursor-pointer hover:shadow-md transition-all duration-200 group"
      onClick={() => navigate(`/activity/${activity.id}`)}
    >
      {/* Image */}
      <div className="relative h-44 overflow-hidden">
        <img
          src={activity.image}
          alt={activity.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <span className="absolute top-3 left-3 bg-pink-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
          {activity.category}
        </span>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-bold text-gray-900 text-base mb-1 leading-snug">{activity.name}</h3>

        <div className="flex items-center gap-1 text-gray-400 text-sm mb-4">
          <MapPin className="size-3.5 shrink-0" />
          <span>{activity.location}</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-pink-500 font-bold text-sm">
            {activity.price === 0 ? 'Free Entry' : `GH₵${activity.price}/pp`}
          </span>
          <button
            type="button"
            aria-label={`${remainingSlots} of ${activity.capacity} slots remaining`}
            className="flex items-center gap-1.5 bg-pink-50 text-pink-600 text-xs font-semibold px-2.5 py-1 rounded-full"
          >
            <Users className="size-3" />
            <span>{remainingSlots} slots left</span>
            <span className="text-pink-400">out of {activity.capacity}</span>
          </button>
        </div>

        <div className="mt-3 pt-3 border-t border-gray-100 flex items-center gap-1.5 text-gray-400 text-xs">
          <Calendar className="size-3.5" />
          <span>{format(activity.date, 'EEE, MMM d')}</span>
          <span className="mx-1">·</span>
          <span>{activity.groupSize.min}–{activity.groupSize.max} per group</span>
        </div>
      </div>
    </div>
  );
}
