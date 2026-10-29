import { test } from 'node:test';
import assert from 'node:assert/strict';
import { adventureFilters, getAdventureStatus, isGroupBooking } from './adventureStatus.js';

const now = new Date(2026, 9, 17, 12);
const upcoming = { activityDate: new Date(2026, 9, 20).toISOString(), status: 'booked' };
const cases = [
  ['booked ignores paid payment status', { ...upcoming, paymentStatus: 'paid' }, 'booked'],
  ['booked ignores confirmation status', { ...upcoming, confirmationStatus: 'confirmed' }, 'booked'],
  ['past booked remains booked', { ...upcoming, activityDate: '2020-01-01' }, 'booked'],
  ['completed uses status', { ...upcoming, status: 'completed' }, 'completed'],
  ['confirmed uses status', { ...upcoming, status: 'confirmed' }, 'confirmed'],
  ['refunded uses status', { ...upcoming, status: 'refunded' }, 'refunded'],
  ['cancelled uses status', { ...upcoming, status: 'cancelled' }, 'cancelled'],
  ['history bucket cannot override status', { ...upcoming, historyStatus: 'completed' }, 'booked'],
  ['normalizes case and whitespace', { ...upcoming, status: ' Confirmed ' }, 'confirmed'],
];
for (const [label, activity, expected] of cases) {
  test(label, () => assert.equal(getAdventureStatus(activity, now), expected));
}
test('requested filter order', () => {
  assert.deepEqual(adventureFilters.map(filter => filter.id), ['completed', 'confirmed', 'booked', 'refunded', 'group-booking']);
});

test('group bookings use the API isGroupBooking flag', () => {
  assert.equal(isGroupBooking({ isGroupBooking: true, status: 'booked' }), true);
  assert.equal(isGroupBooking({ isGroupBooking: true, status: 'cancelled' }), true);
  assert.equal(isGroupBooking({ isGroupBooking: false, bookingType: 'group' }), false);
  assert.equal(isGroupBooking({ bookingType: 'invite' }), false);
  assert.equal(isGroupBooking({ bookingType: 'surprise' }), false);
  assert.equal(isGroupBooking({ historyStatus: 'Group Bookings' }), false);
  assert.equal(isGroupBooking({ groupParticipants: ['Alex', 'Sam'], status: 'confirmed' }), false);
  assert.equal(isGroupBooking({}), false);
});

test('API group booking with one participant is included regardless of participant count', () => {
  const activity = {
    id: 'b50ad2be-418f-4b39-8e4d-8cd1badb0bfe',
    name: 'Barossa Valley Hot Air Balloon & Vineyard Brunch',
    status: 'booked',
    activityDate: '2026-11-05T05:45:00Z',
    cancellationDate: null,
    groupParticipants: ['Saani Taggao'],
    isGroupBooking: true,
  };
  assert.equal(isGroupBooking(activity), true);
  assert.equal(getAdventureStatus(activity, now), 'booked');
  assert.equal(isGroupBooking({ ...activity, isGroupBooking: false }), false);
});
