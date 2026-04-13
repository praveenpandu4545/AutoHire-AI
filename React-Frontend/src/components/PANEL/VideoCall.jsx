import React, { useEffect } from "react";
import AgoraRTC from "agora-rtc-sdk-ng";

const APP_ID = "babae1f9a55346b0839ac7f5f55232f3";
const TOKEN = null;

const VideoCall = ({ channelName, callId, onEnd }) => {

  useEffect(() => {
    let client = null;
    let localAudioTrack = null;
    let localVideoTrack = null;
    let isActive = true;

    // 🔥 SAFE VIDEO PLAY FUNCTION
    const playVideo = (track) => {
      const container = document.getElementById("remote-player");
      if (!container) return;

      container.innerHTML = "";

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

          } catch (err) {
            console.error("Subscribe error:", err);
          }
        });

        console.log("Joining channel...");
        await client.join(APP_ID, channelName, TOKEN, null);
        console.log("Joined successfully");

        if (!isActive) return;

        localAudioTrack = await AgoraRTC.createMicrophoneAudioTrack();
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

  return (
    <div>
      <h2>Video Call</h2>

      <div style={{ display: "flex", gap: "20px" }}>
        <div>
          <h4>My Video</h4>
          <div
            id="local-player"
            style={{ width: "300px", height: "200px", background: "black" }}
          />
        </div>

        <div>
          <h4>Remote Video</h4>
          <div
            id="remote-player"
            style={{ width: "300px", height: "200px", background: "black" }}
          />
        </div>
      </div>

      <button
        onClick={endCall}
        style={{ marginTop: "20px", background: "red", color: "white" }}
      >
        End Call
      </button>
    </div>
  );
};

export default VideoCall;