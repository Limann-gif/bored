import type { Activity } from '../app/types';

const AUTH_PATH = 'http://localhost:5000/api';

// Shape returned by the C# backend for Activity
interface BackendActivity {
  id?: string;
  activityId?: string;
  name: string;
  description: string;
  category: string;
  price: number;
  capacity: number;
  groupSizeMin: number;
  groupSizeMax: number;
  location: string;
  imageUrl?: string | null;
  date?: string;
}

function authHeaders(extra: Record<string, string> = {}): Record<string, string> {
  const token = localStorage.getItem('boredToken');
  return {
    ...extra,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

function mapActivity(data: BackendActivity): Activity {
  const parsed = data.date ? new Date(data.date) : null;
  return {
    id: data.id ?? data.activityId ?? '',
    name: data.name,
    description: data.description,
    category: data.category,
    price: data.price,
    capacity: data.capacity,
    groupSize: { min: data.groupSizeMin, max: data.groupSizeMax },
    location: data.location,
    image: data.imageUrl ?? '',
    date: parsed && !isNaN(parsed.getTime()) ? parsed : new Date(),
    vibes: [],
  };
}

export const apiService = {
  // ── Auth ─────────────────────────────────────────────────────────────────

  async signup(username: string, email: string, password: string): Promise<void> {
    const response = await fetch(`${AUTH_PATH}/user/signup`, {
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
    const response = await fetch(`${AUTH_PATH}/user/login`, {
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
    const response = await fetch(`${AUTH_PATH}/activities/activityList`, {
      headers: authHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch activities');
    const json: { data: BackendActivity[] } = await response.json();
    return json.data.map(mapActivity);
  },

  async bookActivity(
    activityId: string,
    group?: { participantsName: string[]; participantsEmail: string[] },
  ): Promise<void> {
    const response = await fetch(`${AUTH_PATH}/activities/bookActivity`, {
      method: 'POST',
      headers: authHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({
        activityId,
        participantsName: group?.participantsName ?? [],
        participantsEmail: group?.participantsEmail ?? [],
        isGroup: !!group,
      }),
    });
    if (!response.ok) {
      const message = await response.text();
      throw new Error(message || 'Failed to book activity');
    }
  },

  async getActivity(id: string): Promise<Activity> {
    const response = await fetch(`${AUTH_PATH}/activities/activity/${id}`, {
      headers: authHeaders(),
    });
    if (!response.ok) throw new Error('Activity not found');
    const json: { data: BackendActivity } = await response.json();
    // Backend omits id from the response body — inject it from the URL param
    return { ...mapActivity(json.data), id };
  },

  async addActivity(activity: Activity): Promise<Activity> {
    const response = await fetch(`${AUTH_PATH}/activities/addActivity`, {
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
    const json: { data: BackendActivity } = await response.json();
    return mapActivity(json.data);
  },
};
