import React, { useEffect, useState } from "react";
import VideoCall from "../PANEL/VideoCall";

const StudentVC = () => {
  const [incomingCall, setIncomingCall] = useState(null);
  const [callStarted, setCallStarted] = useState(false);

  const BASE_URL = import.meta.env.VITE_SPRING_API_BASE_URL;

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await fetch(`${BASE_URL}/springApi/interviews/incoming-call`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) return;

        const text = await res.text();
        if (!text) return;

        const data = JSON.parse(text);

        if (data && (data.status === "CALLING" || data.status === "ACCEPTED")) {
          setIncomingCall(data);
        }

      } catch (err) {
        console.error(err);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const acceptCall = async () => {
    const token = localStorage.getItem("token");

    await fetch(`${BASE_URL}/springApi/interviews/accept/${incomingCall.id}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    setCallStarted(true);
  };

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

  const handleEnd = () => {
    setCallStarted(false);
    setIncomingCall(null);
  };

  return (
    <div>
      <h2>Interview Calls</h2>

      {!callStarted && incomingCall && (
        <div style={{ border: "2px solid black", padding: "20px" }}>
          <h3>📞 Incoming Interview Call</h3>

          <button onClick={acceptCall}>Accept</button>
          <button onClick={rejectCall}>Reject</button>
        </div>
      )}

      {callStarted && (
        <VideoCall
          channelName={incomingCall.channelName}
          callId={incomingCall.id}
          onEnd={handleEnd}
        />
      )}
    </div>
  );
};

export default StudentVC;