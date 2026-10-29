import { test } from 'node:test';
import assert from 'node:assert/strict';
import { clearGroupBookingDrafts, getGroupBookingDraftKey } from './groupBookingDraft.js';

function storageMock() {
  const data = new Map();
  return {
    get length() { return data.size; },
    key: index => [...data.keys()][index] ?? null,
    getItem: key => data.get(key) ?? null,
    setItem: (key, value) => data.set(key, value),
    removeItem: key => data.delete(key),
  };
}
const token = exp => `header.${btoa(JSON.stringify({ exp }))}.signature`;

test('draft survives reopening the same activity and is isolated by user and activity', () => {
  const storage = storageMock();
  storage.setItem('boredToken', token(2000));
  const key = getGroupBookingDraftKey('user1', 'activity1', storage, 1000);
  storage.setItem(key, JSON.stringify({ friends: [{ name: 'Alex', email: 'alex@example.com' }], step: 1 }));
  assert.equal(getGroupBookingDraftKey('user1', 'activity1', storage, 1000), key);
  assert.equal(JSON.parse(storage.getItem(key)).friends[0].name, 'Alex');
  assert.notEqual(getGroupBookingDraftKey('user2', 'activity1', storage, 1000), key);
  assert.notEqual(getGroupBookingDraftKey('user1', 'activity2', storage, 1000), key);
});
test('expired sessions discard drafts', () => {
  const storage = storageMock();
  storage.setItem('boredToken', token(2));
  const key = getGroupBookingDraftKey('u', 'a', storage, 1000);
  storage.setItem(key, '{}');
  assert.equal(getGroupBookingDraftKey('u', 'a', storage, 2000), null);
  assert.equal(storage.getItem(key), null);
});
test('logout clears all drafts and the next session uses a different key', () => {
  const storage = storageMock();
  storage.setItem('boredToken', token(2000));
  const key = getGroupBookingDraftKey('u', 'a', storage, 1000);
  storage.setItem(key, '{}');
  storage.setItem('unrelated', 'keep');
  clearGroupBookingDrafts(storage);
  assert.equal(storage.getItem(key), null);
  assert.equal(storage.getItem('unrelated'), 'keep');
  assert.notEqual(getGroupBookingDraftKey('u', 'a', storage, 1000), key);
});
test('no draft is available without authentication', () => {
  assert.equal(getGroupBookingDraftKey('u', 'a', storageMock()), null);
});
