import { clearGroupBookingDrafts } from '../app/utils/groupBookingDraft.js';

export const SESSION_TIMEOUT_EVENT = 'bored:session-timeout';

export function expireSession() {
  const hadSession = localStorage.getItem('boredUser') || localStorage.getItem('boredToken');
  clearGroupBookingDrafts();
  localStorage.removeItem('boredUser');
  localStorage.removeItem('boredToken');
  if (hadSession) window.dispatchEvent(new Event(SESSION_TIMEOUT_EVENT));
}

export async function sessionRequest(url, options, fetchRequest = fetch) {
  const requestToken = localStorage.getItem('boredToken');
  const hadSession = Boolean(requestToken || localStorage.getItem('boredUser'));
  if (hadSession && !requestToken) {
    expireSession();
    throw new Error('Session timed out. Please sign in again.');
  }
  const response = await fetchRequest(url, options);
  const body = await response.clone().text();
  let message = body;
  let code;
  try {
    const json = JSON.parse(body);
    message = typeof json === 'string' ? json : json?.message || json?.error?.message || json?.error || '';
    code = Number(json?.code);
  } catch { /* Some authentication failures are plain text. */ }
  const invalidToken = typeof message === 'string' && /(?:invalid or missing user token|(?:invalid|missing|expired)\s+(?:user\s+|access\s+)?token|token\s+(?:is\s+)?(?:invalid|missing|expired))/i.test(message);
  if (hadSession && (response.status === 401 || code === 401 || invalidToken)) {
    // An old request must not end a newly signed-in session.
    if (localStorage.getItem('boredToken') === requestToken) expireSession();
    throw new Error('Session timed out. Please sign in again.');
  }
  return response;
}
