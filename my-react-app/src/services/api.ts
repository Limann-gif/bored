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
  activityDate?: string;
}

function authHeaders(extra: Record<string, string> = {}): Record<string, string> {
  const token = localStorage.getItem('boredToken');
  return {
    ...extra,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

function mapActivity(data: BackendActivity): Activity {
  // Normalise Postgres-style timestamps (space separator, +00 offset) to
  // strict ISO 8601 so all JS engines parse them correctly.
  const normalised = data.activityDate
    ? data.activityDate.replace(' ', 'T').replace(/\+00$/, 'Z')
    : null;
  const parsed = normalised ? new Date(normalised) : new Date(0);
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
    date: parsed,
    activityDate: parsed,
    vibes: [],
  };
}

export interface AdminUserRecord {
  id: string;
  username: string;
  email: string;
  role: string;
  bookingCount: number;
}

export interface AdminUserDetail {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  bio: string | null;
  occupation: string | null;
  locationAddress: string | null;
  role: string;
  joinedAt: string;
  bookingOrders: unknown[];
  transactions: unknown[];
  complaints: unknown[];
}

interface BackendUserDetail extends Partial<AdminUserDetail> {
  userId?: string;
  username?: string;
}

export interface AdminGroupMember {
  name: string;
  isPaymentCompleted: boolean;
}

export interface AdminGroupRecord {
  nameOfActivity: string;
  numberOfParticipants: number;
  activityStatus: string;
  createdAt: string;
  members: AdminGroupMember[];
  reviews: unknown[];
}

export interface PaymentCallbackPayload {
  transactionId: string;
  amount: number;
  createdAt: string;
  status: 'success';
}

export interface PaymentHistoryRecord {
  transactionId: string;
  userName: string;
  transactionDate: string;
  amount: number;
  status: string;
}

export interface GroupMembersRecord {
  activityName: string;
  groupMembers: string[];
}

export interface PaymentOrderRecord {
  id: string;
  activityId: string | null;
  activityName: string;
  amount: number;
  status: string;
  activityDate: string | null;
  location: string | null;
  imageUrl: string | null;
}

export interface InitializePaymentPayload {
  userId: string;
  activityId: string;
  orderId: string;
}

export interface UserActivityHistoryItem {
  id: string;
  name: string;
  description: string | null;
  category: string;
  price: number;
  capacity: number;
  groupSizeMin: number;
  groupSizeMax: number;
  location: string;
  imageUrl: string | null;
  createdAt: string;
  status: string;
  activityDate: string;
  cancellationDate: string | null;
  cancellationReason: string | null;
  bookingOrders: unknown[];
}

export type UserActivityHistory = Record<string, UserActivityHistoryItem[]>;

export interface ActivityBookingOrderRecord extends UserActivityHistoryItem {
  orderId: string;
  activityId: string;
  groupMembers: string[];
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
      body: JSON.stringify({ email, password, role: 'USER' }),
    });
    if (!response.ok) {
      const message = await response.text();
      throw new Error(message || 'Invalid credentials');
    }
    const data = await response.json();
    return data.token as string;
  },

  // ── Payments ────────────────────────────────────────────────────────────

  async sendPaymentCallback(payload: PaymentCallbackPayload): Promise<void> {
    const response = await fetch(`${AUTH_PATH}/payment/callback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const message = await response.text();
      throw new Error(message || 'Payment could not be confirmed. Please try again.');
    }
  },

  async initializePayment(payload: InitializePaymentPayload): Promise<string> {
    const response = await fetch(`${AUTH_PATH}/payment/initialize`, {
      method: 'POST',
      headers: authHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const message = await response.text();
      throw new Error(message || 'Payment could not be started. Please try again.');
    }

    const json = await response.json() as Record<string, unknown>;
    const data = typeof json.data === 'object' && json.data !== null
      ? json.data as Record<string, unknown>
      : json;
    const authorizationUrl = data.authorizationUrl ?? data.authorization_url ?? data.url;

    if (typeof authorizationUrl !== 'string' || !authorizationUrl) {
      throw new Error('The payment provider did not return a checkout link.');
    }

    return authorizationUrl;
  },

  async verifyPayment(reference: string): Promise<void> {
    const response = await fetch(`${AUTH_PATH}/payment/verify/${encodeURIComponent(reference)}`, {
      method: 'GET',
      headers: authHeaders(),
    });

    if (!response.ok) {
      const message = await response.text();
      throw new Error(message || 'Payment verification failed. Please try again.');
    }

    const body = await response.text();
    if (!body) return;

    let json: Record<string, unknown>;
    try {
      json = JSON.parse(body) as Record<string, unknown>;
    } catch {
      return;
    }

    const data = typeof json.data === 'object' && json.data !== null
      ? json.data as Record<string, unknown>
      : json;
    const status = data.status ?? data.paymentStatus ?? json.status;
    const verified = data.verified ?? data.isVerified ?? json.success;

    if (verified === false || (typeof status === 'string' && ['failed', 'failure', 'cancelled', 'abandoned'].includes(status.toLowerCase()))) {
      throw new Error('Paystack could not confirm this payment.');
    }
  },

  async getPaymentHistory(): Promise<PaymentHistoryRecord[]> {
    const response = await fetch(`${AUTH_PATH}/payment/paymentHistory`, {
      headers: authHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch payment history');
    const json: { data?: PaymentHistoryRecord[] } = await response.json();
    return json.data ?? [];
  },

  async getPaymentOrder(orderId: string): Promise<PaymentOrderRecord> {
    const response = await fetch(`${AUTH_PATH}/payment/order/${encodeURIComponent(orderId)}`, {
      headers: authHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch payment order');
    const json: { data?: Record<string, unknown> } = await response.json();
    const data = json.data;
    if (!data) throw new Error('Payment order not found');

    const activity = typeof data.activity === 'object' && data.activity !== null
      ? data.activity as Record<string, unknown>
      : {};
    const amount = Number(data.amount ?? data.totalAmount ?? data.price ?? 0);
    const activityDate = typeof data.activityDate === 'string'
      ? data.activityDate
      : typeof activity.activityDate === 'string' ? activity.activityDate : null;
    return {
      id: String(data.id ?? data.orderId ?? orderId),
      activityId: typeof data.activityId === 'string'
        ? data.activityId
        : typeof activity.id === 'string' ? activity.id : null,
      activityName: String(data.activityName ?? activity.name ?? data.name ?? 'Activity booking'),
      amount: Number.isFinite(amount) ? amount : 0,
      status: String(data.status ?? 'pending'),
      activityDate: activityDate?.startsWith('0001-01-01') ? null : activityDate,
      location: typeof data.location === 'string'
        ? data.location
        : typeof activity.location === 'string' ? activity.location : null,
      imageUrl: typeof data.imageUrl === 'string'
        ? data.imageUrl
        : typeof activity.imageUrl === 'string' ? activity.imageUrl : null,
    };
  },

  async getGroupMembers(groupId: string): Promise<GroupMembersRecord[]> {
    const response = await fetch(`${AUTH_PATH}/groups/getGroupMembers/${encodeURIComponent(groupId)}`, {
      headers: authHeaders(),
    });
    if (!response.ok) {
      const message = await response.text();
      throw new Error(message || 'Could not load group members');
    }
    const json: { data?: GroupMembersRecord[] | null } = await response.json();
    if (!Array.isArray(json.data)) throw new Error('No group members found');
    return json.data;
  },

  async getUserActivityHistory(userId: string): Promise<UserActivityHistory> {
    const response = await fetch(`${AUTH_PATH}/activities/getUserActivityHistory/${encodeURIComponent(userId)}`, {
      headers: authHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch activity history');
    const json: { data?: UserActivityHistory | null } = await response.json();
    return json.data ?? {};
  },

  async getAllGroupsActivityHistory(): Promise<ActivityBookingOrderRecord[]> {
    const response = await fetch(`${AUTH_PATH}/groups/getAllGroupsActivityHistory`, {
      headers: authHeaders(),
    });
    if (!response.ok) {
      const message = await response.text();
      throw new Error(message || 'Failed to fetch booked activity history');
    }

    const json = await response.json() as Record<string, unknown>;
    const root = json.data ?? json;
    const records: ActivityBookingOrderRecord[] = [];

    const textValue = (value: unknown, fallback = '') => typeof value === 'string' ? value : fallback;
    const numberValue = (value: unknown, fallback = 0) => {
      const parsed = Number(value);
      return Number.isFinite(parsed) ? parsed : fallback;
    };
    const memberNames = (value: unknown): string[] => Array.isArray(value)
      ? value.map(member => typeof member === 'string'
        ? member
        : member && typeof member === 'object'
          ? textValue((member as Record<string, unknown>).name)
          : '').filter(Boolean)
      : [];

    const addOrder = (order: Record<string, unknown>, activity: Record<string, unknown>, inheritedStatus?: string) => {
      const orderId = textValue(order.orderId ?? order.id ?? order.bookingOrderId);
      const activityId = textValue(order.activityId ?? activity.activityId ?? activity.id);
      if (!orderId && !activityId) return;
      const status = textValue(order.status ?? order.orderStatus ?? activity.activityStatus ?? activity.status, inheritedStatus ?? 'booked');
      const members = memberNames(order.members ?? order.groupMembers ?? activity.members ?? activity.groupMembers);
      records.push({
        id: activityId,
        activityId,
        orderId,
        name: textValue(activity.name ?? activity.activityName ?? activity.nameOfActivity ?? order.activityName, 'Activity booking'),
        description: textValue(activity.description) || null,
        category: textValue(activity.category),
        price: numberValue(order.amount ?? order.totalAmount ?? activity.price),
        capacity: numberValue(activity.capacity),
        groupSizeMin: numberValue(activity.groupSizeMin),
        groupSizeMax: numberValue(activity.groupSizeMax),
        location: textValue(activity.location),
        imageUrl: textValue(activity.imageUrl) || null,
        createdAt: textValue(order.createdAt ?? activity.createdAt),
        status,
        activityDate: textValue(activity.activityDate ?? activity.date ?? order.activityDate),
        cancellationDate: textValue(order.cancellationDate ?? activity.cancellationDate) || null,
        cancellationReason: textValue(order.cancellationReason ?? activity.cancellationReason) || null,
        bookingOrders: [],
        groupMembers: members,
      });
    };

    const visit = (value: unknown, inheritedStatus?: string) => {
      if (Array.isArray(value)) {
        value.forEach(item => visit(item, inheritedStatus));
        return;
      }
      if (!value || typeof value !== 'object') return;
      const object = value as Record<string, unknown>;
      const orders = object.activityBookingOrders ?? object.bookingOrders;
      if (Array.isArray(orders)) {
        orders.forEach(order => {
          if (order && typeof order === 'object') addOrder(order as Record<string, unknown>, object, inheritedStatus);
        });
        return;
      }
      if ('orderId' in object || 'bookingOrderId' in object) {
        const nestedActivity = object.activity && typeof object.activity === 'object'
          ? object.activity as Record<string, unknown>
          : object;
        addOrder(object, nestedActivity, inheritedStatus);
        return;
      }
      if ('nameOfActivity' in object && 'activityStatus' in object) {
        addOrder(object, object, inheritedStatus);
        return;
      }
      Object.entries(object).forEach(([key, nested]) => visit(nested, key));
    };

    visit(root);
    return records;
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

  async getUserById(id: string): Promise<AdminUserDetail> {
    const response = await fetch(`${AUTH_PATH}/user/getUser/${id}`, {
      headers: authHeaders(),
    });
    if (!response.ok) throw new Error('User not found');
    const json: { data?: BackendUserDetail } | BackendUserDetail = await response.json();
    const data = ('data' in json ? json.data : json) as BackendUserDetail | undefined;

    if (!data) throw new Error('User not found');

    return {
      id: data.id ?? data.userId ?? id,
      name: data.name ?? data.username ?? 'Unknown user',
      email: data.email ?? '',
      phone: data.phone ?? null,
      bio: data.bio ?? null,
      occupation: data.occupation ?? null,
      locationAddress: data.locationAddress ?? null,
      role: data.role ?? 'USER',
      joinedAt: data.joinedAt ?? new Date(0).toISOString(),
      bookingOrders: data.bookingOrders ?? [],
      transactions: data.transactions ?? [],
      complaints: data.complaints ?? [],
    };
  },

  async getUsers(): Promise<AdminUserRecord[]> {
    const response = await fetch(`${AUTH_PATH}/user/getUsers`, {
      headers: authHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch users');
    const json: { data: AdminUserRecord[] } = await response.json();
    return json.data;
  },

  async getAdminGroups(): Promise<AdminGroupRecord[]> {
    const response = await fetch(`${AUTH_PATH}/groups/getAllGroupsActivityHistory`, {
      headers: authHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch group history');
    const json = await response.json() as { data?: unknown };
    const data = json.data;
    if (!Array.isArray(data)) return [];

    return data.map((item): AdminGroupRecord => {
      const record = item && typeof item === 'object' ? item as Record<string, unknown> : {};
      const rawMembers = record.members ?? record.groupMembers;
      const members: AdminGroupMember[] = Array.isArray(rawMembers)
        ? rawMembers.map(member => {
          if (typeof member === 'string') return { name: member, isPaymentCompleted: false };
          const value = member && typeof member === 'object' ? member as Record<string, unknown> : {};
          return {
            name: typeof value.name === 'string' ? value.name : 'Unknown member',
            isPaymentCompleted: value.isPaymentCompleted === true,
          };
        })
        : [];
      return {
        nameOfActivity: typeof record.nameOfActivity === 'string'
          ? record.nameOfActivity
          : typeof record.activityName === 'string' ? record.activityName : 'Activity booking',
        numberOfParticipants: Number(record.numberOfParticipants ?? members.length) || 0,
        activityStatus: typeof record.activityStatus === 'string'
          ? record.activityStatus
          : typeof record.status === 'string' ? record.status : 'booked',
        createdAt: typeof record.createdAt === 'string' ? record.createdAt : new Date(0).toISOString(),
        members,
        reviews: Array.isArray(record.reviews) ? record.reviews : [],
      };
    });
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
