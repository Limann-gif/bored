// Core type definitions for Bored! app

export interface User {
  id: string;
  name: string;
  email: string;
  role?: 'ADMIN' | 'USER';
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
  activityDate : Date;
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
  status: 'forming' | 'booked' | 'confirmed' | 'completed' | 'cancelled';
  createdAt: Date;
  activityDate: Date;
  bookingType?: 'invite' | 'surprise';
  totalPrice?: number;
  snapshot?: {
    name: string;
    image: string;
    description: string;
    location: string;
    price: number;
  };
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

export interface GroupBookingRecord {
  id: string;
  userId: string;
  creatorEmail: string;
  activityId: string;
  bookingType: 'invite' | 'surprise';
  friends: { name: string; email: string }[];
  totalPrice: number;
  bookedAt: string; // ISO string
}
