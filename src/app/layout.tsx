import type { Metadata } from "next";
import { IBM_Plex_Sans_Thai } from "next/font/google";
import "./globals.css";

const plexThai = IBM_Plex_Sans_Thai({
  weight: ["400", "500", "600", "700"],
  subsets: ["thai", "latin"],
  variable: "--font-thai",
});

export const metadata: Metadata = {
  title: "AI Daily Brief — ข่าว AI วันละ 1 เรื่อง",
  description:
    "ข่าว AI ที่ควรรู้ที่สุดของวัน สรุปละเอียดอ่านจบใน 3–5 นาที",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th">
      <body
        className={plexThai.variable}
        style={{ fontFamily: "var(--font-thai), system-ui, sans-serif" }}
      >
        {children}
      </body>
    </html>
  );
}
