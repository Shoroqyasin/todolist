"use client";
import { useState, useEffect } from "react";
import { supabase } from "../../../supabaseClient"; // Adjust the import path as necessary
import { useRouter } from "next/navigation";

export default function ResetPassword() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { query } = router;

  // State to hold the access token
  const [accessToken, setAccessToken] = useState("");

  useEffect(() => {
    // Check if the query object is defined and if it contains access_token
    if (query && query.access_token) {
      setAccessToken(query.access_token);
    }
  }, [query]);

  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      setMessage("كلمات المرور غير متطابقة.");
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
      access_token: accessToken, // Include the access token
    });

    if (error) {
      setMessage("حدث خطأ أثناء تحديث كلمة المرور.");
    } else {
      setMessage("تم تحديث كلمة المرور بنجاح!");
      setTimeout(() => {
        router.push("/login"); // Redirect to login page after successful reset
      }, 2000);
    }
    setLoading(false);
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-4 border rounded">
      <h2 className="text-xl font-semibold mb-4">تحديث كلمة المرور</h2>
      {loading ? (
        <p>جاري التحديث...</p>
      ) : (
        <form onSubmit={handleResetPassword} className="space-y-4">
          <input
            type="password"
            placeholder="كلمة المرور الجديدة"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
          <input
            type="password"
            placeholder="تأكيد كلمة المرور"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
          <button
            type="submit"
            className="bg-blue-600 text-white p-2 rounded w-full"
          >
            تحديث كلمة المرور
          </button>
        </form>
      )}
      {message && <p className="mt-4 text-center">{message}</p>}
    </div>
  );
}
