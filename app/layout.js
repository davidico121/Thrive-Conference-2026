import "./globals.css";

export const metadata = {
  title: "Thrive Conference 2026 — Ibadan",
  description: "Leveraging AI for Business and Career Growth. Free event, September 5 2026, International Conference Centre (ICC), Ibadan.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
