// Twice-weekly classes over six weeks.
export const TOTAL_SESSIONS = 12;

export const MAX_FAILED_LOGINS = 5;
export const LOCKOUT_MINUTES = 15;
export const MIN_PASSWORD_LENGTH = 8;

// Failed logins allowed per network address per 15 minutes. Deliberately generous:
// many students share one mobile-carrier address, and a class logging in at the same
// moment shouldn't lock itself out, while still stopping one machine guessing at scale.
export const MAX_FAILURES_PER_IP = 30;
export const IP_WINDOW_MINUTES = 15;
