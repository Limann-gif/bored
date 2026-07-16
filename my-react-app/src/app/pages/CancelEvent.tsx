import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router';
import { useApp } from '../context/AppContext';
import { Sidebar } from '../components/Sidebar';
import { Button } from '../components/ui/button';
import { Textarea } from '../components/ui/textarea';
import { Calendar, MapPin, Users, AlertTriangle, ChevronLeft } from 'lucide-react';
import { format } from 'date-fns';

const PRESET_REASONS = [
  "Something came up at work",
  "I'm not feeling well",
  "Personal emergency",
  "Scheduling conflict",
  "Change of plans",
  "Other",
];

export default function CancelEvent() {
  const { groupId } = useParams<{ groupId: string }>();
  const { groups, activities, removeGroup } = useApp();
  const navigate = useNavigate();

  const [selectedReason, setSelectedReason] = useState('');
  const [customReason, setCustomReason] = useState('');

  const group = groups.find(g => g.id === groupId);
  const activity = useMemo(
    () => (group ? activities.find(a => a.id === group.activityId) : undefined),
    [group, activities]
  );

  if (!group || !activity) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <main className="flex-1 flex items-center justify-center">
          <p className="text-gray-500">Event not found.</p>
        </main>
      </div>
    );
  }

  const effectiveReason =
    selectedReason === 'Other' ? customReason.trim() : selectedReason;
  const canSubmit = !!effectiveReason;

  const handleCancel = () => {
    removeGroup(group.id);
    navigate('/my-groups');
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />

      <main className="flex-1 flex flex-col items-center py-12 px-4">
        <div className="w-full max-w-lg">
          {/* Back */}
          <button
            onClick={() => navigate('/my-groups')}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 mb-8 transition-colors"
          >
            <ChevronLeft className="size-4" />
            Back to My Groups
          </button>

          {/* Activity summary card */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-6">
            <div className="h-36 overflow-hidden relative">
              <img
                src={activity.image}
                alt={activity.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              <span className="absolute bottom-3 left-4 text-white font-extrabold text-lg leading-tight drop-shadow">
                {activity.name}
              </span>
            </div>
            <div className="px-5 py-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-500">
              <span className="flex items-center gap-1.5">
                <Calendar className="size-4 text-gray-400" />
                {format(new Date(group.activityDate), 'EEE, MMM d, yyyy')}
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin className="size-4 text-gray-400" />
                {group.meetingPoint.address}
              </span>
              <span className="flex items-center gap-1.5">
                <Users className="size-4 text-gray-400" />
                {group.members.length} people
              </span>
            </div>
          </div>

          {/* Warning banner */}
          <div className="flex items-start gap-3 bg-red-50 border border-red-100 rounded-xl px-4 py-3 mb-6">
            <AlertTriangle className="size-5 text-red-500 mt-0.5 shrink-0" />
            <p className="text-sm text-red-700 leading-relaxed">
              Cancelling will remove you from this group. Your group members will be notified.
              This action cannot be undone.
            </p>
          </div>

          {/* Reason selection */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="font-bold text-gray-900 mb-1">Why are you cancelling?</h2>
            <p className="text-sm text-gray-400 mb-5">Select a reason so we can improve future matches.</p>

            <div className="grid grid-cols-2 gap-2 mb-4">
              {PRESET_REASONS.map(reason => (
                <button
                  key={reason}
                  onClick={() => setSelectedReason(reason)}
                  className={`text-sm text-left px-4 py-3 rounded-xl border font-medium transition-all ${
                    selectedReason === reason
                      ? 'border-red-400 bg-red-50 text-red-700'
                      : 'border-gray-100 bg-gray-50 text-gray-600 hover:border-gray-300 hover:bg-gray-100'
                  }`}
                >
                  {reason}
                </button>
              ))}
            </div>

            {selectedReason === 'Other' && (
              <Textarea
                placeholder="Tell us more…"
                value={customReason}
                onChange={e => setCustomReason(e.target.value)}
                className="mb-4 resize-none text-sm"
                rows={3}
              />
            )}

            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => navigate('/my-groups')}
              >
                Keep Event
              </Button>
              <Button
                disabled={!canSubmit}
                onClick={handleCancel}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white border-0 disabled:opacity-40"
              >
                Cancel Event
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
