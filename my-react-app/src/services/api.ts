import type { Activity } from '../app/types';

const AUTH_PATH = 'http://localhost:5000/api/user';

// Shape returned by the C# backend for Activity
interface BackendActivity {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  capacity: number;
  groupSizeMin: number;
  groupSizeMax: number;
  location: string;
  imageUrl?: string | null;
  date: string;
}

function authHeaders(extra: Record<string, string> = {}): Record<string, string> {
  const token = localStorage.getItem('boredToken');
  return {
    ...extra,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

function mapActivity(data: BackendActivity): Activity {
  return {
    id: data.id,
    name: data.name,
    description: data.description,
    category: data.category,
    price: data.price,
    capacity: data.capacity,
    groupSize: { min: data.groupSizeMin, max: data.groupSizeMax },
    location: data.location,
    image: data.imageUrl ?? '',
    date: new Date(data.date),
    vibes: [],
  };
}

export const apiService = {
  // ── Auth ─────────────────────────────────────────────────────────────────

  async signup(username: string, email: string, password: string): Promise<void> {
    const response = await fetch(`${AUTH_PATH}/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password }),
    });
    if (!response.ok) {
      const message = await response.text();
      throw new Error(message || 'Sign up failed');
    }
  },

  async login(email: string, password: string): Promise<string> {
    const response = await fetch(`${AUTH_PATH}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!response.ok) {
      const message = await response.text();
      throw new Error(message || 'Invalid credentials');
    }
    const data = await response.json();
    return data.token as string;
  },

  // ── Activities ───────────────────────────────────────────────────────────

  async getActivities(): Promise<Activity[]> {
    const response = await fetch(`${AUTH_PATH}/activityList`, {
      headers: authHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch activities');
    const data: BackendActivity[] = await response.json();
    return data.map(mapActivity);
  },

  async getActivity(id: string): Promise<Activity> {
    const response = await fetch(`${AUTH_PATH}/activity/${id}`, {
      headers: authHeaders(),
    });
    if (!response.ok) throw new Error('Activity not found');
    const data: BackendActivity = await response.json();
    return mapActivity(data);
  },

  async addActivity(activity: Activity): Promise<Activity> {
    const response = await fetch(`${AUTH_PATH}/addActivity`, {
      method: 'POST',
      headers: authHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({
        name: activity.name,
        description: activity.description,
        category: activity.category,
        price: activity.price,
        capacity: activity.capacity,
        groupSizeMin: activity.groupSize.min,
        groupSizeMax: activity.groupSize.max,
        location: activity.location,
        imageUrl: activity.image || null,
        date: activity.date,
      }),
    });
    if (!response.ok) {
      const message = await response.text();
      throw new Error(message || 'Failed to add activity');
    }
    const data: BackendActivity = await response.json();
    return mapActivity(data);
  },
};
