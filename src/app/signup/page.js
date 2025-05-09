"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../supabaseClient";

export default function Signup() {
  const router = useRouter();
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    console.log("🔁 Signup component rendered");
  });

  const handleSignup = async (e) => {
    e.preventDefault();
    console.log("📨 Signup form submitted:", { email, password, displayName });

    // Create user in Supabase Auth with additional metadata
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: displayName, // Store the display name as user metadata
        },
      },
    });

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
          type="text"
          placeholder="الاسم الظاهر"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          className="border w-full p-2 rounded"
          required
        />
        <input
          type="email"
          placeholder="البريد الإلكتروني"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border w-full p-2 rounded"
          required
        />
        <input
          type="password"
          placeholder="كلمة المرور"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border w-full p-2 rounded"
          required
        />
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded w-full"
        >
          إنشاء حساب
        </button>
      </form>
    </div>
  );
}
