import React, { useEffect, useState } from "react";
import AgoraRTC from "agora-rtc-sdk-ng";
import "../../css/VideoCall.css";

const APP_ID = "babae1f9a55346b0839ac7f5f55232f3";
const TOKEN = null;

const VideoCall = ({ channelName, callId, onEnd }) => {

  const [audioTrack, setAudioTrack] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [remoteJoined, setRemoteJoined] = useState(false);

  useEffect(() => {
    let client = null;
    let localAudioTrack = null;
    let localVideoTrack = null;
    let isActive = true;

    const playVideo = (track) => {
      const container = document.getElementById("remote-player");
      if (!container) return;

      // ✅ prevent destroying video on re-render
      if (container.childNodes.length > 0) return;

      const videoDiv = document.createElement("div");
      videoDiv.style.width = "100%";
      videoDiv.style.height = "100%";

      container.appendChild(videoDiv);
      track.play(videoDiv);
    };

    const init = async () => {
      try {
        client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });

        // ✅ IMPORTANT: ATTACH BEFORE JOIN
        client.on("user-published", async (user, mediaType) => {
          try {
            console.log("User published:", user.uid, mediaType);

            await client.subscribe(user, mediaType);

            if (mediaType === "video") {
              playVideo(user.videoTrack);
            }

            if (mediaType === "audio") {
              user.audioTrack.play();
            }
            if (mediaType === "video") {
              setRemoteJoined(true);
            }

          } catch (err) {
            console.error("Subscribe error:", err);
          }
        });

        console.log("Joining channel...");
        await client.join(APP_ID, channelName, TOKEN, null);
        console.log("Joined successfully");

        if (!isActive) return;

        localAudioTrack = await AgoraRTC.createMicrophoneAudioTrack();
        setAudioTrack(localAudioTrack);
        localVideoTrack = await AgoraRTC.createCameraVideoTrack();

        if (!isActive) return;

        console.log("Publishing tracks...");
        await client.publish([localAudioTrack, localVideoTrack]);
        console.log("Published successfully");

        // ✅ Local video
        localVideoTrack.play("local-player");

        // 🔥 HANDLE EXISTING USERS (FIXED)
        setTimeout(async () => {
          if (!client || !client.remoteUsers) return;

          console.log("Existing users:", client.remoteUsers);

          for (let user of client.remoteUsers) {
            try {
              if (user.hasVideo) {
                await client.subscribe(user, "video");
                playVideo(user.videoTrack);
              }

              if (user.hasAudio) {
                await client.subscribe(user, "audio");
                user.audioTrack.play();
              }
            } catch (err) {
              console.error("Existing user error:", err);
            }
          }
        }, 500);

        // 🔥 USER LEFT
        client.on("user-unpublished", () => {
          const container = document.getElementById("remote-player");
          if (container) container.innerHTML = "";
        });

        client.on("user-left", () => {
          setRemoteJoined(false);
          const container = document.getElementById("remote-player");
          if (container) container.innerHTML = "";
        });

      } catch (err) {
        console.error("Init error:", err);
      }
    };

    if (channelName) {
      init();
    }

    // 🔥 POLLING (UNCHANGED)
    const interval = setInterval(async () => {
      try {
        if (!callId) return;

        const token = localStorage.getItem("token");

        const res = await fetch(
          `${import.meta.env.VITE_SPRING_API_BASE_URL}/springApi/interviews/incoming-call`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!res.ok) return;

        const text = await res.text();

        if (!text || text === "null") return;

        let data;
        try {
          data = JSON.parse(text);
        } catch {
          return;
        }

        if (
          data.status === "COMPLETED" ||
          data.status === "REJECTED"
        ) {
          console.log("Call ended from other side");

          if (isActive) {
            clearInterval(interval);
            onEnd();
          }
        }

      } catch (err) {
        console.error("Polling error:", err);
      }
    }, 2000);

    return () => {
      isActive = false;
      clearInterval(interval);

      try {
        if (localAudioTrack) localAudioTrack.close();
        if (localVideoTrack) localVideoTrack.close();

        if (client) {
          client.leave();
          client = null;
        }
      } catch (err) {
        console.error("Cleanup error:", err);
      }
    };

  }, [channelName, callId]);

  const endCall = async () => {
    try {
      const token = localStorage.getItem("token");

      await fetch(
        `${import.meta.env.VITE_SPRING_API_BASE_URL}/springApi/interviews/end-call/${callId}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      onEnd();

    } catch (err) {
      console.error("End call error:", err);
    }
  };

  const toggleMute = async () => {
    if (!audioTrack) return;

    if (isMuted) {
      await audioTrack.setMuted(false);   // 🔊 Unmute
      setIsMuted(false);
    } else {
      await audioTrack.setMuted(true);    // 🔇 Mute
      setIsMuted(true);
    }
  };

  return (
      <div className="video-container">

        {/* 🔥 MAIN VIDEO */}
        {!remoteJoined && (
          <div className="waiting-overlay">
            <h2 className="waiting-text">Waiting for others to join...</h2>
          </div>
        )}
        <div className="main-video" id="remote-player" />

        {/* 🔥 SMALL VIDEO */}
        <div className="small-video" id="local-player" />

        <button className="end-btn" onClick={endCall}>
          End Call
        </button>

        {/* <button className="mute-btn" onClick={toggleMute}>
          {isMuted ? "Unmute" : "Mute"}
        </button> */}

      </div>
    );
};

export default VideoCall;