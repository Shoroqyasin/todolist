"use client";
import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

export default function Home() {
  const [session, setSession] = useState(null);

  // Function to check if the user is an admin based on the role

  useEffect(() => {
    const getSessionAndUser = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      console.log("Session data:", sessionData); // Log session data
      setSession(sessionData.session);
    };

    getSessionAndUser();
  }, []); // Only run once when the component mounts

  return (
    <div style={{ padding: "2rem", fontFamily: "Arial" }}>
      <h1>📋 Task Manager</h1>

      {!session ? (
        <p>Please log in to continue.</p>
      ) : (
        <>
          <p>Welcome! You are logged in.</p>
        </>
      )}
    </div>
  );
}
