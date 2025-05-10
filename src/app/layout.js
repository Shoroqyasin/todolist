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

        <main className="">{children}</main>
        {/* Footer */}
        <footer className="bg-blue-900 text-white py-8">
          <div className="max-w-5xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="mb-6 md:mb-0">
                <div className="text-white font-bold text-2xl flex items-center">
                  <span className="border-2 border-white rounded-full">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                      />
                    </svg>
                  </span>
                  <div className="flex flex-col">
                    <span className="text-sm">Innovation</span>
                    <span className="text-lg">Todo App</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-6 text-center text-sm text-blue-200">
              &copy; {new Date().getFullYear()} Innovation Task Manager. All
              rights reserved.
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
