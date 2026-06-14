import "./globals.css";

export const metadata = {
  title: "Thrive Conference 2026 — Lagos",
  description: "Leveraging AI for Business and Career Growth. Free event, July 18 2026, Christ Unfolding Place, Lagos.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
