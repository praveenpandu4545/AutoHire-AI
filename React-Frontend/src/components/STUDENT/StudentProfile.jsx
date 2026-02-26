import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../css/StudentProfile.css";

function StudentProfile() {
  const [student, setStudent] = useState(null);
  const [showReset, setShowReset] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const navigate = useNavigate();
  const BASE_URL = import.meta.env.VITE_SPRING_API_BASE_URL;

  const token = localStorage.getItem("token");
  const email = localStorage.getItem("email");

  useEffect(() => {
    // 🚨 SAFETY CHECKS (Prevents backend crash)

    if (!token || token.split(".").length !== 3) {
      console.log("Invalid or missing token");
      localStorage.clear();
      navigate("/");
      return;
    }

    if (!email) {
      console.log("Missing email in localStorage");
      navigate("/");
      return;
    }

    fetchStudent();
  }, []);

  const fetchStudent = async () => {
    try {
      const response = await fetch(
        `${BASE_URL}/springApi/student/${email}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch student data");
      }

      const data = await response.json();
      setStudent(data);
    } catch (error) {
      console.error("Error fetching student:", error);
      alert("Session expired. Please login again.");
      localStorage.clear();
      navigate("/");
    }
  };

  const handleResetPassword = async () => {
    try {
      if (!oldPassword || !newPassword || !confirmPassword) {
        alert("All fields are required");
        return;
      }

      const response = await fetch(
        `${BASE_URL}/api/reset-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            oldPassword,
            newPassword,
            confirmPassword,
          }),
        }
      );

      const message = await response.text();

      if (!response.ok) {
        alert(message);
        return;
      }

      alert(message);

      setShowReset(false);
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");

    } catch (error) {
      alert("Password reset failed");
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  if (!student) {
    return <div className="profile-card">Loading...</div>;
  }

  return (
    <div className="profile-card">
      <h2>User Profile</h2>

      <p><strong>Name :</strong> {student.name}</p>
      <p><strong>StudentID :</strong> {student.studentId}</p>
      <p><strong>Email :</strong> {student.email}</p>
      <p><strong>College :</strong> {student.collegeName}</p>
      <p><strong>Department :</strong> {student.department}</p>
      <p><strong>Phone :</strong> {student.phone}</p>
      <p><strong>Role :</strong> STUDENT</p>

      <div className="button-group">
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
            placeholder="Old Password"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
          />

          <input
            type="password"
            placeholder="New Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />

          <input
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />

          <button className="submit-btn" onClick={handleResetPassword}>
            Submit
          </button>
        </div>
      )}
    </div>
  );
}

export default StudentProfile;