import { test } from 'node:test';
import assert from 'node:assert/strict';
import { sessionRequest, SESSION_TIMEOUT_EVENT } from './sessionRequest.js';

function setup() {
  const data = new Map([['boredUser', '{}'], ['boredToken', 'current-token'], ['boredGroupBookingProgress-draft', '{}']]);
  globalThis.localStorage = {
    get length() { return data.size; },
    key: index => [...data.keys()][index],
    getItem: key => data.get(key) ?? null,
    setItem: (key, value) => data.set(key, value),
    removeItem: key => data.delete(key),
  };
  globalThis.window = new EventTarget();
  let events = 0;
  window.addEventListener(SESSION_TIMEOUT_EVENT, () => events++);
  return { data, events: () => events };
}

for (const [label, body, status] of [
  ['unauthorized', '{}', 401],
  ['plain text error', 'Invalid or missing user token', 400],
  ['JSON error in HTTP 200', JSON.stringify({ message: 'Invalid or missing user token' }), 200],
  ['application code', JSON.stringify({ code: 401, message: 'Unauthorized' }), 200],
]) {
  test(label, async () => {
    const state = setup();
    await assert.rejects(sessionRequest('/api/test', {}, async () => new Response(body, { status })), /Session timed out/);
    assert.equal(state.data.has('boredToken'), false);
    assert.equal(state.data.has('boredUser'), false);
    assert.equal(state.data.has('boredGroupBookingProgress-draft'), false);
    assert.equal(state.events(), 1);
  });
}
test('missing token logs out without making a request', async () => {
  const state = setup();
  state.data.delete('boredToken');
  await assert.rejects(sessionRequest('/api/test', {}, async () => { assert.fail('must not fetch'); }), /Session timed out/);
  assert.equal(state.events(), 1);
});
test('permission errors and successful responses preserve session and response body', async () => {
  const state = setup();
  for (const status of [200, 403, 500]) {
    const response = await sessionRequest('/api/test', {}, async () => new Response('{"message":"Other result"}', { status }));
    assert.equal(await response.text(), '{"message":"Other result"}');
  }
  assert.equal(state.events(), 0);
  assert.equal(state.data.get('boredToken'), 'current-token');
});
test('network failure preserves session', async () => {
  const state = setup();
  await assert.rejects(sessionRequest('/api/test', {}, async () => { throw new Error('Network unavailable'); }), /Network unavailable/);
  assert.equal(state.events(), 0);
});
test('old failed request cannot clear a newly signed-in session', async () => {
  const state = setup();
  await assert.rejects(sessionRequest('/api/test', {}, async () => {
    state.data.set('boredToken', 'new-token');
    return new Response('', { status: 401 });
  }), /Session timed out/);
  assert.equal(state.data.get('boredToken'), 'new-token');
  assert.equal(state.events(), 0);
});
