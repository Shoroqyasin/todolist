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

    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) {
      console.error("Error sending reset link:", error.message); // Log the error message
      if (error.message.includes("rate limit exceeded")) {
        setMessage(
          "لقد قمت بإرسال العديد من الطلبات. يرجى الانتظار قبل المحاولة مرة أخرى."
        );
      } else {
        setMessage("حدث خطأ في إرسال رابط إعادة تعيين كلمة المرور.");
      }
    } else {
      setMessage("تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني.");
    }
    setLoading(false);
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-4 border rounded">
      <h2 className="text-xl font-semibold mb-4">
        طلب إعادة تعيين كلمة المرور
      </h2>
      {loading ? (
        <p>جاري إرسال الرابط...</p>
      ) : (
        <form onSubmit={handleRequestResetLink} className="space-y-4">
          <input
            type="email"
            placeholder="البريد الإلكتروني"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
          <button
            type="submit"
            className="bg-blue-600 text-white p-2 rounded w-full"
          >
            إرسال رابط إعادة تعيين كلمة المرور
          </button>
        </form>
      )}
      {message && <p className="mt-4 text-center">{message}</p>}
    </div>
  );
}
