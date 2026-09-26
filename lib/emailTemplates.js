import { displayFirstName, escapeHtml } from './names.js';

export const PORTAL_LOGIN_URL = 'https://thrive.crumglobal.org/portal/login';

function shell(inner) {
  return `
<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1b1c1a;">
  <div style="background: #170f30; padding: 24px 32px; text-align: center;">
    <span style="font-family: Georgia, serif; font-weight: 800; font-size: 20px; color: #fbf9f6; letter-spacing: -0.01em;">THRIVE <span style="color: #fecb00;">SKILLS</span></span>
  </div>
  <div style="padding: 32px; background: #ffffff;">${inner}</div>
  <div style="background: #0c0620; padding: 20px 32px; text-align: center;">
    <p style="color: #6b628f; font-size: 12px; margin: 0;">&copy; 2026 Thrive Initiatives &middot; Christ Unfolding Ministries</p>
  </div>
</div>`.trim();
}

export function tutorWelcomeEmail({ fullName, className, username, tempPassword }) {
  const name = escapeHtml(displayFirstName(fullName));
  return {
    subject: 'Your Thrive Skills tutor login',
    html: shell(`
    <p style="font-size: 16px; line-height: 1.6; margin: 0 0 16px;">Hello ${name},</p>
    <p style="font-size: 16px; line-height: 1.6; margin: 0 0 20px;">
      Your tutor account for the <strong>${escapeHtml(className)}</strong> class is ready. From your portal you can see your students and take attendance.
    </p>
    <div style="background: #f6f3ff; border-left: 4px solid #fecb00; padding: 16px 20px; margin: 0 0 24px;">
      <p style="font-size: 13px; letter-spacing: 0.06em; text-transform: uppercase; color: #6b628f; margin: 0 0 4px;">Username</p>
      <p style="font-size: 24px; font-weight: 800; margin: 0 0 14px;">${escapeHtml(username)}</p>
      <p style="font-size: 13px; letter-spacing: 0.06em; text-transform: uppercase; color: #6b628f; margin: 0 0 4px;">Temporary password</p>
      <p style="font-size: 22px; font-weight: 700; letter-spacing: 0.1em; margin: 0; font-family: 'Courier New', monospace;">${escapeHtml(tempPassword)}</p>
    </div>
    <p style="font-size: 16px; line-height: 1.6; margin: 0 0 12px;">You'll be asked to choose your own password the first time you log in.</p>
    <p style="margin: 0 0 28px;">
      <a href="${PORTAL_LOGIN_URL}" style="display: inline-block; background: #fecb00; color: #17102e; font-weight: 700; font-size: 15px; text-decoration: none; padding: 14px 28px; border-radius: 4px;">Log in to the portal</a>
    </p>
    <p style="font-size: 16px; line-height: 1.6; margin: 0;"><strong>The Thrive Team</strong></p>`),
  };
}

export function welcomeEmail({ fullName, className, code, tempPassword }) {
  const name = escapeHtml(displayFirstName(fullName));
  return {
    subject: `Your Thrive Number: ${code}`,
    html: shell(`
    <p style="font-size: 16px; line-height: 1.6; margin: 0 0 16px;">Hello ${name},</p>
    <p style="font-size: 16px; line-height: 1.6; margin: 0 0 20px;">
      You're officially part of the <strong>${escapeHtml(className)}</strong> class at Thrive Digital Skills Training. Here are your student details:
    </p>
    <div style="background: #f6f3ff; border-left: 4px solid #fecb00; padding: 16px 20px; margin: 0 0 24px;">
      <p style="font-size: 13px; letter-spacing: 0.06em; text-transform: uppercase; color: #6b628f; margin: 0 0 4px;">Your Thrive Number (also your username)</p>
      <p style="font-size: 28px; font-weight: 800; letter-spacing: 0.08em; margin: 0 0 14px;">${escapeHtml(code)}</p>
      <p style="font-size: 13px; letter-spacing: 0.06em; text-transform: uppercase; color: #6b628f; margin: 0 0 4px;">Temporary password</p>
      <p style="font-size: 22px; font-weight: 700; letter-spacing: 0.1em; margin: 0; font-family: 'Courier New', monospace;">${escapeHtml(tempPassword)}</p>
    </div>
    <p style="font-size: 16px; line-height: 1.6; margin: 0 0 12px;">
      Remember your Thrive Number: your tutor will use it when taking attendance, and you'll use it to log in to your student portal.
      You'll be asked to choose your own password the first time you log in.
    </p>
    <p style="margin: 0 0 28px;">
      <a href="${PORTAL_LOGIN_URL}" style="display: inline-block; background: #fecb00; color: #17102e; font-weight: 700; font-size: 15px; text-decoration: none; padding: 14px 28px; border-radius: 4px;">Log in to your portal</a>
    </p>
    <p style="font-size: 16px; line-height: 1.6; margin: 0 0 4px;">See you in class!</p>
    <p style="font-size: 16px; line-height: 1.6; margin: 0;"><strong>The Thrive Team</strong></p>`),
  };
}
