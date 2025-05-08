// app/layout.js (or layout.tsx if using TypeScript)
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import Navbar from "./Navbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata = {
  title: "Task App",
  description: "Simple task manager with Supabase and Next.js",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} antialiased`}>
        <Navbar />

        <main className="p-4">{children}</main>
      </body>
    </html>
  );
}
