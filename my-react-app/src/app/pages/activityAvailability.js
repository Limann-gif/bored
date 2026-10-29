export function isUpcomingActivity(activity, now = new Date()) {
  const date = new Date(activity.activityDate);
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return !Number.isNaN(date.getTime()) && date >= today;
}
