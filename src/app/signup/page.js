"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../supabaseClient";

export default function Signup() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    console.log("🔁 Signup component rendered");
  });

  const handleSignup = async (e) => {
    e.preventDefault();
    console.log("📨 Signup form submitted:", { email, password });

    const { error } = await supabase.auth.signUp({ email, password });

    if (error) {
      console.error("❌ Signup error:", error.message);
      setErrorMsg(error.message);
    } else {
      console.log("✅ Signup successful, redirecting to dashboard...");
      router.push("/dashboard");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-4 border rounded">
      <h2 className="text-xl font-semibold mb-4">Sign Up</h2>
      <form onSubmit={handleSignup} className="space-y-4">
        <input
          type="email"
          placeholder="Email"
          className="w-full p-2 border rounded"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full p-2 border rounded"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {errorMsg && <p className="text-red-600">{errorMsg}</p>}
        <button
          type="submit"
          className="bg-blue-600 text-white p-2 rounded w-full"
        >
          Sign Up
        </button>
      </form>
    </div>
  );
}
