import { test } from 'node:test';
import assert from 'node:assert/strict';
import { adventureFilters, getAdventureStatus, isGroupBooking } from './adventureStatus.js';

const now = new Date(2026, 9, 17, 12);
const upcoming = { activityDate: new Date(2026, 9, 20).toISOString(), status: 'booked' };
const cases = [
  ['unpaid booking', upcoming, 'booked'],
  ['paid overrides booked', { ...upcoming, paymentStatus: 'Paid' }, 'confirmed'],
  ['confirmed booking', { ...upcoming, confirmationStatus: 'confirmed' }, 'confirmed'],
  ['past paid booking', { ...upcoming, activityDate: new Date(2026, 9, 16).toISOString(), paymentStatus: 'paid' }, 'completed'],
  ['activity today stays upcoming', { ...upcoming, activityDate: new Date(2026, 9, 17).toISOString() }, 'booked'],
  ['explicit completion', { ...upcoming, status: 'completed' }, 'completed'],
  ['cancelled paid booking', { ...upcoming, status: 'cancelled', paymentStatus: 'paid' }, 'cancelled'],
  ['refunded confirmed booking', { ...upcoming, confirmationStatus: 'confirmed', paymentStatus: 'refunded' }, 'refunded'],
  ['refund request', { ...upcoming, historyStatus: 'Request Refund' }, 'cancelled'],
  ['past cancellation', { ...upcoming, activityDate: '2026-10-01', cancellationDate: '2026-09-30' }, 'cancelled'],
  ['pending with unknown date', { ...upcoming, activityDate: 'invalid', status: 'pending' }, 'booked'],
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

test('completed refunds remain visible even with a cancellation date', () => {
  assert.equal(getAdventureStatus({ ...upcoming, cancellationDate: '2026-10-15', paymentStatus: 'refunded' }, now), 'refunded');
  assert.equal(getAdventureStatus({ ...upcoming, status: 'requestrefund' }, now), 'cancelled');
});
