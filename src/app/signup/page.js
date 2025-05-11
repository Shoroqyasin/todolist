"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../supabaseClient";

export default function Signup() {
  const router = useRouter();
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    console.log("🔁 Signup component rendered");
  }, []);

  const handleSignup = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!displayName || displayName.length < 3) {
      setErrorMsg("Display name must be at least 3 characters long.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setErrorMsg("Please enter a valid email address.");
      return;
    }

    if (password.length < 6) {
      setErrorMsg("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg("Passwords do not match.");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: displayName,
        },
      },
    });

    setLoading(false);

    if (error) {
      console.error("❌ Signup error:", error.message);

      setErrorMsg(error.message);
    } else {
      console.log("✅ Signup successful, redirecting to dashboard...");
      router.push("/login");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center text-blue-600 mb-6">
          Create Your Account
        </h2>

        <form onSubmit={handleSignup} className="space-y-5">
          <input
            type="text"
            placeholder="Display Name"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
            required
          />

          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
            required
          />

          <input
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
            required
          />

          {errorMsg && (
            <p className="text-red-600 text-sm text-center">{errorMsg}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded text-white transition ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {loading ? "Creating account..." : "Sign Up"}
          </button>
        </form>
      </div>
    </div>
  );
}
