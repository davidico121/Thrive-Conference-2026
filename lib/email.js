// Sends one email through ZeptoMail. Throws with the API's response on failure.
export async function sendEmail({ to, subject, html }) {
  const res = await fetch('https://api.zeptomail.com/v1.1/email', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: process.env.ZEPTOMAIL_TOKEN,
    },
    body: JSON.stringify({
      from: { address: process.env.ZEPTOMAIL_FROM_EMAIL, name: process.env.ZEPTOMAIL_FROM_NAME },
      to: [{ email_address: { address: to.address, name: to.name || to.address } }],
      subject,
      htmlbody: html,
    }),
  });
  if (!res.ok) {
    throw new Error(`ZeptoMail HTTP ${res.status}: ${await res.text()}`);
  }
}
