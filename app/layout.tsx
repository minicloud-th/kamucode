import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "kamucode — Play. Build. Grow.",
  description: "ไอดีเกม ซอร์สโค้ด และพื้นที่เติบโตของพาร์ทเนอร์ รวมไว้ที่ kamucode",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th">
      <body className="antialiased">{children}</body>
    </html>
  );
}
