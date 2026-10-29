export const adventureFilters = [
  { id: 'completed', label: 'Completed', description: 'Activities that have taken place.' },
  { id: 'confirmed', label: 'Confirmed', description: 'Activities that have been paid for.' },
  { id: 'booked', label: 'Booked', description: 'Activities booked but not paid for yet.' },
  { id: 'refunded', label: 'Refunded', description: 'Paid activities that have been refunded.' },
  { id: 'group-booking', label: 'Group Booking', description: 'Activities booked for a group.' },
];

export function getAdventureStatus(activity) {
  return (activity.status || '').trim().toLowerCase();
}

export function isGroupBooking(activity) {
  return activity.isGroupBooking === true;
}
