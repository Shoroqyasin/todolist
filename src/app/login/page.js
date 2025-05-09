"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../supabaseClient";
import Link from "next/link";
import ResetPassword from "./updatepassword/page";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    console.log("🔁 Login component rendered");
  });

  const handleLogin = async (e) => {
    e.preventDefault();
    console.log("📨 Login form submitted:", { email, password });

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error("❌ Login error:", error.message);
      setErrorMsg(error.message);
    } else {
      console.log("✅ Login successful, redirecting to dashboard...");
      router.push("/dashboard");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-4 border rounded">
      <h2 className="text-xl font-semibold mb-4">Login</h2>
      <form onSubmit={handleLogin} className="space-y-4">
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
          Log In
        </button>
      </form>
      <p className="text-sm text-right mt-2">
        <Link href="/login/updatepassword">
          <>هل نسيت كلمة المرور؟</>
        </Link>
      </p>
    </div>
  );
}
