"use client";
import { useState } from "react";
import { supabase } from "../../../supabaseClient";

export default function UpdatePassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRequestResetLink = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const { error } = await supabase.auth.resetPasswordForEmail(email);

    if (error) {
      console.error("Error sending reset link:", error.message);
      if (error.message.includes("rate limit exceeded")) {
        setMessage(
          "You've made too many requests. Please wait a moment before trying again."
        );
      } else {
        setMessage("An error occurred while sending the reset link.");
      }
    } else {
      setMessage("A password reset link has been sent to your email.");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-lg">
        <h2 className="text-2xl font-bold text-center text-blue-600 mb-6">
          Reset Your Password
        </h2>

        {loading ? (
          <p className="text-center text-gray-600">Sending reset link...</p>
        ) : (
          <form onSubmit={handleRequestResetLink} className="space-y-5">
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-lg"
              required
            />
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 rounded-lg text-lg hover:bg-blue-700 transition"
            >
              Send Reset Link
            </button>
          </form>
        )}

        {message && (
          <p className="mt-4 text-center text-sm text-gray-700">{message}</p>
        )}
      </div>
    </div>
  );
}
