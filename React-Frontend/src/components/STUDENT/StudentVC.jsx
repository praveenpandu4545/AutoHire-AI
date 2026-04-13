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

        {/* 🔥 INCOMING CALL */}
        {!callStarted && incomingCall && (
          <div className="call-overlay">
            <div className="call-card">
              <div className="call-avatar">📞</div>
              <h2 style={{ color: "white" }}>Incoming Interview Call</h2>
              <p>Please join your interview</p>

              <div className="call-actions">
                <button className="accept-btn" onClick={acceptCall}>
                  Accept
                </button>
                <button className="reject-btn" onClick={rejectCall}>
                  Reject
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 🔥 WAITING SCREEN */}
        {!callStarted && !incomingCall && (
          <div className="waiting-container">

            <div className="waiting-card">

              <h1>⏳ Waiting for your Interview Call</h1>
              <p className="subtitle">
                Kindly wait for the panel to start your interview
              </p>

              <div className="instructions">
                <ul>
                  <li>📶 Ensure stable internet connection</li>
                  <li>🎥 Keep your camera ready</li>
                  <li>🎙 Check microphone before joining</li>
                  <li>🔕 Stay in this page</li>
                </ul>
              </div>

            </div>

          </div>
        )}

        {/* 🔥 VIDEO CALL */}
        {callStarted && incomingCall && (
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