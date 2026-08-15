import React, { createContext, useContext, useState, useEffect } from 'react';
import { Activity, Group, GroupBookingRecord, UserActivitySelection } from '../types';
import { mockUsers } from '../data/mockData';
import { useAuth } from './AuthContext';
import { apiService } from '../../services/api';

interface AppContextType {
  activities: Activity[];
  activitiesLoading: boolean;
  activitiesError: string;
  groups: Group[];
  userSelections: UserActivitySelection[];
  selectActivity: (activity: Activity, location: { lat: number; lng: number; address: string }) => void;
  removeGroup: (groupId: string) => void;
  addGroup: (group: Group) => void;
  getUserGroups: () => Group[];
  updateGroupStatus: (groupId: string, status: Group['status']) => void;
  addActivity: (activity: Activity) => Promise<void>;
  removeActivity: (activityId: string) => void;
  removeSelection: (userId: string, activityId: string) => void;
  groupBookings: GroupBookingRecord[];
  addGroupBooking: (booking: GroupBookingRecord) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [activitiesLoading, setActivitiesLoading] = useState(true);
  const [activitiesError, setActivitiesError] = useState('');
  // Previous booking data has been cleared, so all activities begin with no
  // local reservations. The effects below replace any stale browser storage.
  const [groups, setGroups] = useState<Group[]>([]);
  const [userSelections, setUserSelections] = useState<UserActivitySelection[]>([]);
  const [groupBookings, setGroupBookings] = useState<GroupBookingRecord[]>([]);

  // Fetch activities once the user is authenticated
  useEffect(() => {
    if (!user) return;
    setActivitiesLoading(true);
    setActivitiesError('');
    apiService.getActivities()
      .then(setActivities)
      .catch((err: Error) => setActivitiesError(err.message))
      .finally(() => setActivitiesLoading(false));
  }, [user?.id]);

  useEffect(() => {
    localStorage.setItem('boredGroups', JSON.stringify(groups));
  }, [groups]);

  useEffect(() => {
    localStorage.setItem('boredSelections', JSON.stringify(userSelections));
  }, [userSelections]);

  useEffect(() => {
    localStorage.setItem('boredGroupBookings', JSON.stringify(groupBookings));
  }, [groupBookings]);

  const calculateCentroid = (locations: Array<{ lat: number; lng: number }>) => {
    const lat = locations.reduce((sum, loc) => sum + loc.lat, 0) / locations.length;
    const lng = locations.reduce((sum, loc) => sum + loc.lng, 0) / locations.length;
    return { lat, lng };
  };

  const selectActivity = (
    activity: Activity,
    location: { lat: number; lng: number; address: string }
  ) => {
    if (!user) return;

    const activityId = activity.id;

    // Create user selection
    const selection: UserActivitySelection = {
      userId: user.id,
      activityId,
      location,
      timestamp: new Date(),
    };

    setUserSelections(prev => [...prev, selection]);

    // Matching algorithm: find or create a group
    // Get all selections for this activity (excluding current user's previous selections)
    const activitySelections = userSelections.filter(
      s => s.activityId === activityId && s.userId !== user.id
    );

    // Add current selection
    const allSelections = [...activitySelections, selection];

    // Check if user was recently in a group with any of these users
    const userRecentGroupMembers = groups
      .filter(g => g.members.some(m => m.userId === user.id))
      .flatMap(g => g.members.map(m => m.userId))
      .filter(id => id !== user.id);

    // Filter out users the current user was recently grouped with
    const eligibleSelections = allSelections.filter(
      s => !userRecentGroupMembers.includes(s.userId) || s.userId === user.id
    );

    // Add mock users if needed to form a group
    const neededUsers = activity.groupSize.min - eligibleSelections.length;
    const availableMockUsers = mockUsers.filter(
      mu => !userRecentGroupMembers.includes(mu.id) && 
      !eligibleSelections.some(s => s.userId === mu.id)
    );

    const mockSelections: UserActivitySelection[] = availableMockUsers
      .slice(0, Math.max(0, neededUsers))
      .map(mu => ({
        userId: mu.id,
        activityId,
        location: mu.location!,
        timestamp: new Date(),
      }));

    const finalSelections = [...eligibleSelections, ...mockSelections].slice(
      0,
      activity.groupSize.max
    );

    // If we have enough people, create a group
    if (finalSelections.length >= activity.groupSize.min) {
      const members = finalSelections.map(s => {
        const memberUser = s.userId === user.id 
          ? user 
          : mockUsers.find(mu => mu.id === s.userId);
        
        return {
          userId: s.userId,
          name: memberUser?.name || 'Unknown',
          location: s.location,
          joinedAt: s.timestamp,
        };
      });

      const locations = members.map(m => m.location);
      const centroid = calculateCentroid(locations);

      const newGroup: Group = {
        id: `group-${Date.now()}`,
        activityId,
        members,
        meetingPoint: {
          ...centroid,
          address: `Meeting Point near ${location.address}`,
        },
        status: 'booked',
        createdAt: new Date(),
        activityDate: activity.activityDate,
        snapshot: {
          name: activity.name,
          image: activity.image,
          description: activity.description,
          location: activity.location,
          price: activity.price,
        },
      };

      setGroups(prev => [...prev, newGroup]);

      // Clear selections for this activity
      setUserSelections(prev => 
        prev.filter(s => !finalSelections.some(fs => fs.userId === s.userId && fs.activityId === activityId))
      );
    }
  };

  const getUserGroups = () => {
    if (!user) return [];
    return groups.filter(g => g.members.some(m => m.userId === user.id));
  };

  const updateGroupStatus = (groupId: string, status: Group['status']) => {
    setGroups(prev => prev.map(g => g.id === groupId ? { ...g, status } : g));
  };

  const removeGroup = (groupId: string) => {
    setGroups(prev => prev.filter(g => g.id !== groupId));
  };

  const addGroup = (group: Group) => {
    setGroups(prev => [...prev, group]);
  };

  const addActivity = async (activity: Activity) => {
    const created = await apiService.addActivity(activity);
    setActivities(prev => [...prev, created]);
  };

  const removeActivity = (activityId: string) => {
    setActivities(prev => prev.filter(a => a.id !== activityId));
  };

  const removeSelection = (userId: string, activityId: string) => {
    setUserSelections(prev => prev.filter(s => !(s.userId === userId && s.activityId === activityId)));
  };

  const addGroupBooking = (booking: GroupBookingRecord) => {
    setGroupBookings(prev => [...prev, booking]);
  };

  return (
    <AppContext.Provider
      value={{
        activities,
        activitiesLoading,
        activitiesError,
        groups,
        userSelections,
        selectActivity,
        getUserGroups,
        updateGroupStatus,
        removeGroup,
        addGroup,
        addActivity,
        removeActivity,
        removeSelection,
        groupBookings,
        addGroupBooking,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
