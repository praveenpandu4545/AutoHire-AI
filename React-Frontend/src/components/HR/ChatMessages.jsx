import React, { useEffect, useState, useRef } from "react";
import { connectSocket, sendMessage } from "../../websocket/socket";
import { getUser, getToken } from "../../utils/auth";
import "../../css/ChatMessages.css";

const BASE_URL = import.meta.env.VITE_SPRING_API_BASE_URL;

const ChatMessages = () => {

  const user = getUser();
  const hrEmail = user.email;

  const [allUsers, setAllUsers] = useState([]);
  const [showUsersModal, setShowUsersModal] = useState(false);

  const [modalSearch, setModalSearch] = useState("");

  const [roleFilter, setRoleFilter] = useState("STUDENT");
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);

  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");

  const bottomRef = useRef(null);

  const loadConversations = async () => {

    try {

      const token = getToken();

      const res = await fetch(
        `${BASE_URL}/api/chat/conversations?role=${roleFilter}`,
        {
          headers: { Authorization: "Bearer " + token }
        }
      );

      const data = await res.json();

      setUsers(data);
      setSelectedUser(null);
      setMessages([]);

    } catch (err) {
      console.error(err);
    }

  };

  const fetchAllUsers = async () => {

    try {

      const token = getToken();

      const endpoint =
        roleFilter === "STUDENT"
          ? "/springApi/student/getAllStudents"
          : "/springApi/student/getAllPanels";

      const res = await fetch(
        `${BASE_URL}${endpoint}`,
        {
          headers: {
            Authorization: "Bearer " + token
          }
        }
      );

      const data = await res.json();

      setAllUsers(data);

      setShowUsersModal(true);

    } catch (err) {
      console.error(err);
    }

  };

  useEffect(() => {
    loadConversations();
  }, [roleFilter]);

  useEffect(() => {
    connectSocket(handleIncomingMessage, () => {});
  }, [selectedUser]);

  const handleIncomingMessage = (msg) => {

    if (!selectedUser) return;

    const isChatMessage =
      (msg.senderId === selectedUser && msg.receiverId === hrEmail) ||
      (msg.senderId === hrEmail && msg.receiverId === selectedUser);

    if (isChatMessage) {
      setMessages(prev => [...prev, msg]);
    }

  };

  const loadHistory = async (email) => {

    try {

      setSelectedUser(email);

      const token = getToken();

      const res = await fetch(
        `${BASE_URL}/api/chat/history?user1=${hrEmail}&user2=${email}`,
        {
          headers: { Authorization: "Bearer " + token }
        }
      );

      const data = await res.json();

      setMessages(data);

    } catch (err) {
      console.error(err);
    }

  };

  const handleSend = () => {

    if (!text.trim() || !selectedUser) return;

    const message = {
      senderId: hrEmail,
      receiverId: selectedUser,
      content: text,
      type: "CHAT"
    };

    sendMessage(message);

    setMessages(prev => [...prev, message]);
    setText("");

  };

  const handleFileSelect = async (e) => {

    const file = e.target.files[0];
    if (!file || !selectedUser) return;

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
      senderId: hrEmail,
      receiverId: selectedUser,
      content: file.name,
      type: "FILE",
      fileId: fileId
    };

    sendMessage(message);

    setMessages(prev => [...prev, message]);

  };

  const getFileIcon = (name) => {

    if (name.endsWith(".pdf")) return "📄";
    if (name.match(/\.(jpg|jpeg|png|gif)$/)) return "🖼️";
    if (name.endsWith(".zip")) return "🗜️";
    if (name.endsWith(".doc") || name.endsWith(".docx")) return "📝";

    return "📎";
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

  const filteredUsers = users.filter(u =>
    u.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const filteredModalUsers = allUsers.filter((u) =>
    u.name.toLowerCase().includes(modalSearch.toLowerCase()) ||
    u.email.toLowerCase().includes(modalSearch.toLowerCase())
  );

  return (

    <div className="wa-chat-hr">

    <div className="chatWrapper">

      <div className="conversationSidebar">

        <div className="sidebarHeader">

          <h3>Messages</h3>

          <input
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="STUDENT">Students</option>
            <option value="PANEL">Panel Members</option>
          </select>
          <button
            className="show-all-btn"
            onClick={fetchAllUsers}
          >
            + Show All {
              roleFilter === "STUDENT"
                ? "Students"
                : "Panel Members"
            }
          </button>

        </div>

        <div className="conversationList">

          {filteredUsers.map((user) => (

            <div
              key={user}
              className={`conversationItem ${
                user === selectedUser ? "activeConversation" : ""
              }`}
              onClick={() => loadHistory(user)}
            >

              <div className="avatar">
                {user.charAt(0).toUpperCase()}
              </div>

              <div className="conversationInfo">
                <span className="conversationName">{user}</span>
                <span className="conversationPreview">Click to open chat</span>
              </div>

            </div>

          ))}

        </div>

      </div>

      <div className="chatSection">

        <div className="chatHeader">

          {selectedUser ? (
            <>
              <div className="avatar large">
                {selectedUser.charAt(0).toUpperCase()}
              </div>
              <span>{selectedUser}</span>
            </>
          ) : (
            "Select a conversation"
          )}

        </div>

        <div className="messageContainer">

          {messages.map((m, i) => (

            <div
              key={i}
              className={
                m.senderId === hrEmail
                  ? "messageBubble outgoing"
                  : "messageBubble incoming"
              }
            >

              {m.type === "CHAT" && m.content}

              {m.type === "FILE" && (
                <span
                  className="fileMessage"
                  onClick={() => downloadFile(m.fileId, m.content)}
                >
                  {getFileIcon(m.content)} {m.content}
                </span>
              )}

            </div>

          ))}

          <div ref={bottomRef}></div>

        </div>

        {selectedUser && (

          <div className="messageInputArea">

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
              placeholder="Type a message..."
            />

            <button onClick={handleSend}>
              Send
            </button>

          </div>

        )}

      </div>

    </div>

    {showUsersModal && (

      <div className="review-modal">

        <div className="review-card-large">

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "15px",
            }}
          >
            <h3>
              All {
                roleFilter === "STUDENT"
                  ? "Students"
                  : "Panel Members"
              }
            </h3>

            <span
              style={{
                cursor: "pointer",
                fontSize: "20px",
              }}
              onClick={() => setShowUsersModal(false)}
            >
              ❌
            </span>
                      </div>
                      <input
              type="text"
              placeholder={`Search ${
                roleFilter === "STUDENT"
                  ? "students"
                  : "panel members"
              }...`}
              value={modalSearch}
              onChange={(e) => setModalSearch(e.target.value)}
              style={{
                width: "100%",
                padding: "10px",
                borderRadius: "8px",
                border: "1px solid #ccc",
                marginBottom: "15px",
                outline: "none",
              }}
            />

          <div
            style={{
              maxHeight: "400px",
              overflowY: "auto",
            }}
          >

            {filteredModalUsers.map((student) => (

              <div
                key={student.id}
                onClick={() => {
                  loadHistory(student.email);
                  setShowUsersModal(false);
                }}
                style={{
                  padding: "12px",
                  borderBottom: "1px solid #ddd",
                  cursor: "pointer",
                }}
              >

                <strong>{student.name}</strong>

                <div
                  style={{
                    fontSize: "13px",
                    color: "gray",
                  }}
                >
                  {student.email}
                </div>

              </div>

            ))}

          </div>

        </div>

      </div>
      

    )}

    </div>

  );

};

export default ChatMessages;