import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Suspense } from "react";
import { Navbar } from "@/components/Navbar";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Auto Channel Studio — Tự Động Tạo Video MXH Chuyên Nghiệp",
  description:
    "Hệ thống sản xuất video AI tự động chuẩn TikTok, Reels, Shorts với giọng đọc Neural tiếng Việt và link cố định.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="vi"
      className={`${geistSans.variable} ${geistMono.variable} dark h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-zinc-950 text-zinc-100 selection:bg-emerald-500/30 selection:text-emerald-300">
        <Suspense fallback={<div className="h-16 border-b border-zinc-800/80 bg-zinc-950/80" />}>
          <Navbar />
        </Suspense>
        <div className="flex-1">{children}</div>
      </body>
    </html>
  );
}
