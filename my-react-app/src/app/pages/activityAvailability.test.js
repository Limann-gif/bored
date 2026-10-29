import { test } from 'node:test';
import assert from 'node:assert/strict';
import { isUpcomingActivity } from './activityAvailability.js';
const now = new Date(2026, 9, 19, 12);
test('user catalog hides previous dates but keeps today and future dates', () => {
  assert.equal(isUpcomingActivity({ activityDate: new Date(2026, 9, 18) }, now), false);
  assert.equal(isUpcomingActivity({ activityDate: new Date(2026, 9, 19) }, now), true);
  assert.equal(isUpcomingActivity({ activityDate: new Date(2026, 10, 5) }, now), true);
  assert.equal(isUpcomingActivity({ activityDate: 'invalid' }, now), false);
});
