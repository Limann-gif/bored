// Core type definitions for Bored! app

export interface User {
  id: string;
  name: string;
  email: string;
  subscriptionStatus: 'active' | 'inactive' | 'trial';
  subscriptionExpiry?: Date;
  location?: {
    lat: number;
    lng: number;
    address: string;
  };
  activityHistory: string[]; // Activity IDs
  groupHistory: string[]; // Group IDs
}

export interface Activity {
  id: string;
  name: string;
  description: string;
  price: number;
  vibes: string[];
  category: string;
  image: string;
  date: Date;
  capacity: number;
  groupSize: { min: number; max: number };
  location: string;
}

export interface Group {
  id: string;
  activityId: string;
  members: GroupMember[];
  meetingPoint: {
    lat: number;
    lng: number;
    address: string;
  };
  status: 'forming' | 'confirmed' | 'completed' | 'cancelled';
  createdAt: Date;
  activityDate: Date;
}

export interface GroupMember {
  userId: string;
  name: string;
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  joinedAt: Date;
}

export interface UserActivitySelection {
  userId: string;
  activityId: string;
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  timestamp: Date;
}
