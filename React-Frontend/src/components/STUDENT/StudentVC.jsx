import React, { useEffect, useState } from "react";

const StudentVC = () => {
  const [incomingCall, setIncomingCall] = useState(null);

  const BASE_URL = import.meta.env.VITE_SPRING_API_BASE_URL;

 useEffect(() => {
  const interval = setInterval(async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(
        `${BASE_URL}/springApi/interviews/incoming-call`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) return;

      // ✅ SAFE PARSING FIX
      const text = await res.text();

      if (!text) return;

      const data = JSON.parse(text);

      if (data && data.status === "CALLING") {
        setIncomingCall(data);
      }

    } catch (err) {
      console.error(err);
    }
  }, 3000);

  return () => clearInterval(interval);
}, []);

  // ✅ ACCEPT
  const acceptCall = async () => {
    const token = localStorage.getItem("token");

    await fetch(`${BASE_URL}/springApi/interviews/accept/${incomingCall.id}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    alert("Call accepted");
  };

  // ❌ REJECT
  const rejectCall = async () => {
    const token = localStorage.getItem("token");

    await fetch(`${BASE_URL}/springApi/interviews/reject/${incomingCall.id}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    setIncomingCall(null);
  };

  return (
    <div>
      <h2>Interview Calls</h2>

      {incomingCall && (
        <div style={{ border: "2px solid black", padding: "20px" }}>
          <h3>📞 Incoming Interview Call</h3>

          <button onClick={acceptCall}>Accept</button>
          <button onClick={rejectCall}>Reject</button>
        </div>
      )}
    </div>
  );
};

export default StudentVC;