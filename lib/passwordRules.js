import { MIN_PASSWORD_LENGTH } from './portalConfig.js';

// The passwords people actually pick, plus words specific to this program. Checked after
// lowercasing and after stripping trailing digits/symbols, so "Password2026!" is caught too.
const COMMON = new Set(`
password passw0rd p@ssword pass letmein welcome admin administrator login master secret qwerty qwertyui qwertyuiop
asdfgh asdfghjk asdfghjkl zxcvbn zxcvbnm azerty abcdef abcdefg abcdefgh abcd iloveyou iloveu ilovegod monkey dragon
sunshine princess football baseball basketball soccer superman batman spiderman starwars pokemon naruto shadow
michael jordan jennifer hunter buster harley ranger tigger charlie daniel thomas robert matthew jessica ashley
nicole hannah samantha andrew joshua justin george killer freedom whatever trustno cheese banana cookie chocolate
summer winter spring autumn flower angel blessing blessed godisgood godislove jesus jesuschrist christ christian
hallelujah amen praise grace mercy faith hope glory heaven emmanuel lagos abuja nigeria naija naijaboy naijagirl
ibadan kano enugu warri ogun oyo biafra yoruba igbo hausa arsenal chelsea liverpool manutd barcelona realmadrid
thrive thriveskills thriveskill thrivecrum thriveinitiatives crum crumglobal skills training student tutor class
portal school learn learning classroom videoediting copywriting graphicdesign uiux socialmedia aiautomation
test testing testuser default changeme change temp temporary guest user hello hello123 abc123 abcd1234 iloveyou1
1q2w3e4r 1qaz2wsx zaq12wsx qazwsx qwerty123 qwerty1 q1w2e3r4 pass1234 password1 password12 password123
`.split(/\s+/).filter(Boolean));

const SEQUENCES = ['0123456789', '9876543210', 'abcdefghijklmnopqrstuvwxyz', 'zyxwvutsrqponmlkjihgfedcba', 'qwertyuiop', 'asdfghjkl', 'zxcvbnm'];

function isSequenceOrRepeat(pw) {
  if (/^(.)\1+$/.test(pw)) return true; // aaaaaaaa, 11111111
  if (/^(.{1,4})\1+$/.test(pw)) return true; // abcabcabc, 12121212
  return SEQUENCES.some(seq => seq.includes(pw));
}

// Returns a human-readable reason the password is unacceptable, or null if it is fine.
// Never leaks which rule matched beyond what helps the person pick a better one.
export function passwordProblem(password, { username = '', fullName = '' } = {}) {
  const pw = String(password || '');
  if (pw.length < MIN_PASSWORD_LENGTH) return `Your new password must be at least ${MIN_PASSWORD_LENGTH} characters.`;

  const lower = pw.toLowerCase();
  const letters = lower.replace(/[^a-z]+$/, ''); // drop trailing digits/symbols: "password2026!" -> "password"
  const easy = 'That password is too easy to guess. Try three or four unrelated words together, like purple-river-lamp.';

  if (COMMON.has(lower) || COMMON.has(letters) || isSequenceOrRepeat(lower)) return easy;
  if (/^\d+$/.test(pw)) return 'A password made only of numbers is too easy to guess. Add letters, or use several words together.';

  if (username && lower.includes(String(username).toLowerCase())) return 'Your password can’t contain your username.';
  const nameParts = String(fullName).toLowerCase().split(/[^a-z]+/).filter(p => p.length >= 4);
  if (nameParts.some(p => lower.includes(p))) return 'Your password can’t contain your name. Pick something only you would know.';

  return null;
}
