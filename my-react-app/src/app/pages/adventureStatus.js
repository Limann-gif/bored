export const adventureFilters = [
  { id: 'completed', label: 'Completed', description: 'Activities that have taken place.' },
  { id: 'confirmed', label: 'Confirmed', description: 'Activities that have been paid for.' },
  { id: 'booked', label: 'Booked', description: 'Activities booked but not paid for yet.' },
  { id: 'refunded', label: 'Refunded', description: 'Paid activities that have been refunded.' },
  { id: 'group-booking', label: 'Group Booking', description: 'Activities booked for a group.' },
];

export function getAdventureStatus(activity, now = new Date()) {
  const statuses = [activity.confirmationStatus, activity.status, activity.historyStatus, activity.paymentStatus]
    .map(value => (value || '').toLowerCase().replace(/[\s_-]/g, ''));
  if (statuses.includes('refunded')) return 'refunded';
  if (activity.cancellationDate || statuses.some(status => ['cancelled', 'canceled', 'refunded', 'refund', 'requestrefund', 'refundrequested'].includes(status))) return 'cancelled';
  const date = new Date(activity.activityDate);
  // Dates without an end time remain upcoming throughout the day of the activity.
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  if (statuses.includes('completed') || (!Number.isNaN(date.getTime()) && date < today)) return 'completed';
  if (statuses.some(status => ['paid', 'confirmed', 'success', 'successful', 'succeeded'].includes(status))) return 'confirmed';
  return 'booked';
}

export function isGroupBooking(activity) {
  return activity.isGroupBooking === true;
}
