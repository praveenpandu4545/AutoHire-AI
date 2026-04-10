import React, { useEffect } from "react";
import AgoraRTC from "agora-rtc-sdk-ng";

const APP_ID = "babae1f9a55346b0839ac7f5f55232f3";
const CHANNEL = "test_channel";
const TOKEN = null;

const VideoCall = () => {
  useEffect(() => {
    const init = async () => {
      try {
        console.log("Starting Agora...");

        const client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });

        await client.join(APP_ID, CHANNEL, TOKEN, null);
        console.log("Joined channel");

        const localAudioTrack = await AgoraRTC.createMicrophoneAudioTrack();
        console.log("Audio track created");

        const localVideoTrack = await AgoraRTC.createCameraVideoTrack();
        console.log("Video track created");

        await client.publish([localAudioTrack, localVideoTrack]);
        console.log("Published tracks");

        localVideoTrack.play("local-player");
        console.log("Playing video");

      } catch (err) {
        console.error("ERROR:", err);
      }
    };

    init();
  }, []);

  return (
    <div>
      <h2>Video Debug</h2>
      <div
        id="local-player"
        style={{
          width: "400px",
          height: "300px",
          backgroundColor: "black"
        }}
      ></div>
    </div>
  );
};

export default VideoCall;