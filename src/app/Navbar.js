"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "../supabaseClient";

export default function Navbar() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    console.log("Navbar mounted");

    const getUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      console.log("getUser response:", data, "error:", error);
      setUser(data?.user ?? null);
    };

    getUser();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log("Auth event:", event, "Session:", session);
        setUser(session?.user ?? null);
      }
    );

    return () => {
      console.log("Navbar unmounted, cleaning up subscription");
      authListener.subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    console.log("Logging out...");
    const { error } = await supabase.auth.signOut();
    if (error) console.error("Logout error:", error);
    else console.log("Logged out successfully");
  };

  console.log("Rendered Navbar with user:", user);

  return (
    <nav className="flex gap-4 p-4 border-b">
      <Link href="/" className="text-blue-600 hover:underline">
        Home
      </Link>
      <Link href="/dashboard" className="text-blue-600 hover:underline">
        Dashboard
      </Link>

      {user ? (
        <button onClick={handleLogout} className="text-red-600 hover:underline">
          Logout
        </button>
      ) : (
        <>
          <Link href="/login" className="text-blue-600 hover:underline">
            Login
          </Link>
          <Link href="/signup" className="text-blue-600 hover:underline">
            Signup
          </Link>
        </>
      )}
    </nav>
  );
}
