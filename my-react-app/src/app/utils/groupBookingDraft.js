const prefix = 'boredGroupBookingProgress-';
const sessionKey = 'boredGroupBookingSession';

export function clearGroupBookingDrafts(storage = localStorage) {
  for (let i = storage.length - 1; i >= 0; i--) {
    const key = storage.key(i);
    if (key?.startsWith(prefix)) storage.removeItem(key);
  }
  storage.removeItem(sessionKey);
}

export function getGroupBookingDraftKey(userId, activityId, storage = localStorage, now = Date.now()) {
  const token = storage.getItem('boredToken');
  if (!userId || !activityId || !token) return null;
  try {
    const payload = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    const claims = JSON.parse(atob(payload.padEnd(Math.ceil(payload.length / 4) * 4, '=')));
    if (claims.exp && Number(claims.exp) * 1000 <= now) {
      clearGroupBookingDrafts(storage);
      return null;
    }
  } catch {
    // Opaque tokens rely on the authentication lifecycle to end the session.
  }
  let session = storage.getItem(sessionKey);
  if (!session) {
    session = crypto.randomUUID();
    storage.setItem(sessionKey, session);
  }
  return `${prefix}${session}-${encodeURIComponent(userId)}-${encodeURIComponent(activityId)}`;
}
