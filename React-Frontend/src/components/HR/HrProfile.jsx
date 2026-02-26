import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../css/UserProfile.css";

const HrProfile = () => {
  const [user, setUser] = useState(null);
  const [showReset, setShowReset] = useState(false);
  const [form, setForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [message, setMessage] = useState("");

  const navigate = useNavigate();
  const BASE_URL = import.meta.env.VITE_SPRING_API_BASE_URL;

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    const token = localStorage.getItem("token");

    const response = await fetch(`${BASE_URL}/api/profile`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await response.json();
    setUser(data);
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleResetPassword = async () => {
  if (form.newPassword !== form.confirmPassword) {
    setMessage("New passwords do not match");
    return;
  }

  try {
    const token = localStorage.getItem("token");

    const response = await fetch(`${BASE_URL}/api/reset-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(form),
    });

    const data = await response.text();

    if (!response.ok) {
      setMessage(data);
      return;
    }

    // ✅ Show success
    setMessage("Password updated successfully");

    // Clear form
    setForm({
      oldPassword: "",
      newPassword: "",
      confirmPassword: "",
    });

    // Hide reset section after 2 seconds
    setTimeout(() => {
      setShowReset(false);
      setMessage("");
    }, 2000);

  } catch (error) {
    console.error(error);
  }
};

  if (!user) return <div>Loading...</div>;

  return (
    <div className="profile-card">
      <h2>User Profile</h2>

      <div className="profile-detail">
        <strong>Name:</strong> {user.name}
      </div>

      <div className="profile-detail">
        <strong>Email:</strong> {user.email}
      </div>

      <div className="profile-detail">
        <strong>Department:</strong> {user.department}
      </div>

      <div className="profile-detail">
        <strong>Phone:</strong> {user.phone}
      </div>

      <div className="profile-detail">
        <strong>Role:</strong> {user.role}
      </div>

      <div className="profile-buttons">
        <button
          className="reset-btn"
          onClick={() => setShowReset(!showReset)}
        >
          Reset Password
        </button>

        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>

      {showReset && (
        <div className="reset-section">
          <input
            type="password"
            name="oldPassword"
            placeholder="Old Password"
            onChange={handleChange}
          />

          <input
            type="password"
            name="newPassword"
            placeholder="New Password"
            onChange={handleChange}
          />

          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm New Password"
            onChange={handleChange}
          />

          <button className="confirm-btn" onClick={handleResetPassword}>
            Confirm Reset
          </button>

          {message && (
                <p
                    className={`message ${
                    message.includes("successfully") ? "success" : "error"
                    }`}
                >
                    {message}
                </p>
                )}
        </div>
      )}
    </div>
  );
};

export default HrProfile;