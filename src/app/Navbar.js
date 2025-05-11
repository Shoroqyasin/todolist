"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "../supabaseClient";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const [user, setUser] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const getUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error) {
        console.error("Error fetching user:", error);
      } else {
        setUser(data?.user ?? null);
      }
    };

    getUser();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsMenuOpen(false);
  };

  return (
    <nav className="fixed top-0 left-0 w-full bg-white shadow-md py-4 px-6 flex items-center justify-between z-50">
      {/* Logo */}
      <Link
        href="/"
        className="flex items-center text-blue-900 font-bold text-2xl"
      >
        <span className="border-2 border-blue-900 rounded-full p-1 mr-2">
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
              d="M13 10V3L4 14h7v7l9-11h-7z"
            />
          </svg>
        </span>
        <div className="flex flex-col leading-tight">
          <span className="text-sm">Innovation</span>
          <span className="text-lg">Universe</span>
        </div>
      </Link>

      {/* Desktop Navigation */}
      <div className="hidden md:flex items-center space-x-6">
        <Link
          href="/"
          className={`${
            pathname === "/"
              ? "bg-blue-700 text-white font-bold px-4 py-1 rounded "
              : "text-blue-900"
          } font-medium hover:underline`}
        >
          HOME
        </Link>

        <Link
          href="/dashboard"
          className={`${
            pathname === "/dashboard"
              ? "bg-blue-700 text-white font-bold px-4 py-1 rounded"
              : "text-blue-900"
          } font-medium hover:underline`}
        >
          DASHBOARD
        </Link>
      </div>

      {/* Desktop Auth */}
      <div className="hidden md:flex items-center space-x-4">
        {user && (
          <span className="font-medium text-blue-900">
            مرحباً، {user.user_metadata?.display_name || "مستخدم"}
          </span>
        )}

        {user ? (
          <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-4 py-1 rounded hover:bg-red-600 transition"
          >
            Logout
          </button>
        ) : (
          <>
            <Link
              href="/login"
              className="text-blue-900 hover:text-blue-700 font-medium"
            >
              LOGIN
            </Link>
            <Link
              href="/signup"
              className="bg-blue-900 text-white px-4 py-1 rounded hover:bg-blue-800 transition"
            >
              SIGNUP
            </Link>
          </>
        )}
      </div>

      {/* Mobile Menu Button */}
      <div className="md:hidden">
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="text-blue-900 focus:outline-none"
        >
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
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
      </div>

      {/* Mobile Dropdown */}
      {isMenuOpen && (
        <div className="absolute top-full right-4 mt-2 w-48 bg-white rounded-md shadow-lg py-2 md:hidden">
          <Link
            href="/"
            className="block px-4 py-2 text-blue-900 hover:bg-blue-100"
          >
            HOME
          </Link>
          <Link
            href="/dashboard"
            className="block px-4 py-2 text-blue-900 hover:bg-blue-100"
          >
            DASHBOARD
          </Link>

          <div className="border-t border-gray-200 my-2" />

          {user ? (
            <>
              <div className="px-4 py-2 text-blue-900 font-medium">
                مرحباً، {user.user_metadata?.display_name || "مستخدم"}
              </div>
              <button
                onClick={handleLogout}
                className="block w-full text-left px-4 py-2 text-red-600 hover:bg-red-100"
              >
                LOGOUT
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="block px-4 py-2 text-blue-900 hover:bg-blue-100"
              >
                LOGIN
              </Link>
              <Link
                href="/signup"
                className="block px-4 py-2 text-blue-900 hover:bg-blue-100"
              >
                SIGNUP
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
