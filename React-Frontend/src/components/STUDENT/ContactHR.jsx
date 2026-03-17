import React, { useEffect, useState } from "react";
import { connectSocket, sendMessage } from "../../websocket/socket";
import { getUser, getToken } from "../../utils/auth";
import "../../css/ContactHR.css";

const BASE_URL = import.meta.env.VITE_SPRING_API_BASE_URL;

const ContactHR = () => {

  const user = getUser();
  const studentEmail = user.email;

  const [hrMembers, setHrMembers] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedHR, setSelectedHR] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");

  useEffect(() => {

    loadHRMembers();

    connectSocket(
      handleIncomingMessage,
      () => {}
    );

  }, [selectedHR]);

  const handleIncomingMessage = (msg) => {

    if (!selectedHR) return;

    const isChatMessage =
      (msg.senderId === studentEmail && msg.receiverId === selectedHR.email) ||
      (msg.senderId === selectedHR.email && msg.receiverId === studentEmail);

    if (isChatMessage) {
      setMessages(prev => [...prev, msg]);
    }

  };

  const downloadFile = async (fileId, fileName) => {

  const token = getToken();

    const res = await fetch(`${BASE_URL}/api/files/${fileId}`, {
      headers: {
        Authorization: "Bearer " + token
      }
    });

    const blob = await res.blob();

    const url = window.URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;

    document.body.appendChild(a);
    a.click();
    a.remove();

  };

  const loadHRMembers = async () => {

    const token = getToken();

    const res = await fetch(
      `${BASE_URL}/springApi/employees/hr-members`,
      {
        headers: { Authorization: "Bearer " + token }
      }
    );

    const data = await res.json();

    setHrMembers(data);
  };

  const selectHR = (hr) => {

    setSelectedHR(hr);
    loadHistory(hr.email);

  };

  const loadHistory = async (hrEmail) => {

    const token = getToken();

    const res = await fetch(
      `${BASE_URL}/api/chat/history?user1=${studentEmail}&user2=${hrEmail}`,
      {
        headers: { Authorization: "Bearer " + token }
      }
    );

    const data = await res.json();

    setMessages(data);
  };

  const handleSend = () => {

    if (!text.trim()) return;

    const message = {
      senderId: studentEmail,
      receiverId: selectedHR.email,
      content: text,
      type: "CHAT"
    };

    sendMessage(message);

    setMessages(prev => [...prev, message]);

    setText("");

  };

  /* FILE UPLOAD */

  const handleFileSelect = async (e) => {

    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    const token = getToken();

    const res = await fetch(`${BASE_URL}/api/files/upload`, {
      method: "POST",
      headers: {
        Authorization: "Bearer " + token
      },
      body: formData
    });

    const fileId = await res.json();

    const message = {
      senderId: studentEmail,
      receiverId: selectedHR.email,
      content: file.name,
      type: "FILE",
      fileId: fileId
    };

    sendMessage(message);

    setMessages(prev => [...prev, message]);

  };

  /* FILE ICONS */

  const getFileIcon = (name) => {

    if (name.endsWith(".pdf")) return "📄";
    if (name.match(/\.(jpg|jpeg|png|gif)$/)) return "🖼️";
    if (name.endsWith(".zip")) return "🗜️";
    if (name.endsWith(".doc") || name.endsWith(".docx")) return "📝";

    return "📎";
  };

  const filteredHR = hrMembers.filter(hr =>
    hr.name.toLowerCase().includes(search.toLowerCase())
  );

  return (

    <div className="chatContainer">

      <div className="hrList">

        <h3>HR Members</h3>

        <input
          placeholder="Search HR..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {filteredHR.map((hr) => (

          <div
            key={hr.id}
            className={`hrCard ${selectedHR?.id === hr.id ? "activeHR" : ""}`}
            onClick={() => selectHR(hr)}
          >
            <div className="hrName">{hr.name}</div>
            <div className="hrDept">{hr.department}</div>
          </div>

        ))}

      </div>

      <div className="chatSection">

        <div className="chatHeader">

          {selectedHR
            ? `Chat with ${selectedHR.name}`
            : "Select HR to start chat"}

        </div>

        <div className="chatMessages">

          {messages.map((m, i) => (

            <div
              key={i}
              className={
                m.senderId === studentEmail
                  ? "messageRight"
                  : "messageLeft"
              }
            >

              {m.type === "CHAT" && m.content}

              {m.type === "FILE" && (
                <span
                  className="fileMessage"
                  onClick={() => downloadFile(m.fileId, m.content)}
                  style={{ cursor: "pointer" }}
                >
                  {getFileIcon(m.content)} {m.content}
                </span>
              )}

            </div>

          ))}

        </div>

        {selectedHR && (

          <div className="chatInput">

            <label className="pinIcon">
              📌

              <input
                type="file"
                style={{ display: "none" }}
                onChange={handleFileSelect}
              />
            </label>

            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Type message..."
            />

            <button onClick={handleSend}>
              Send
            </button>

          </div>

        )}

      </div>

    </div>

  );
};

export default ContactHR;