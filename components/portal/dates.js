// Class times are shown in West African Time.
export function formatWat(iso) {
  if (!iso) return '';
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Africa/Lagos', weekday: 'short', day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit', hour12: true,
  }).format(new Date(iso)) + ' WAT';
}

// ISO time -> the "YYYY-MM-DDTHH:mm" a datetime-local box wants, in WAT (UTC+1).
export function toWatInput(iso) {
  if (!iso) return '';
  return new Date(new Date(iso).getTime() + 3600000).toISOString().slice(0, 16);
}
