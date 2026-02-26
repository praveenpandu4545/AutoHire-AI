import { useState } from "react";
import StudentProfile from "./StudentProfile";
import StudentResume from "./StudentResume";
import StudentDrives from "./StudentDrives";
import "../../css/StudentDashboard.css";

function StudentDashboard() {
  const [activeTab, setActiveTab] = useState("profile");

  return (
    <div className="student-dashboard-container">
      
      {/* Sidebar */}
      <div className="student-sidebar">
        <h2>Student Dashboard</h2>

        <button
          className={activeTab === "profile" ? "active-btn" : ""}
          onClick={() => setActiveTab("profile")}
        >
          Profile
        </button>

        <button
          className={activeTab === "drives" ? "active-btn" : ""}
          onClick={() => setActiveTab("drives")}
        >
          Drives
        </button>

        <button
          className={activeTab === "resume" ? "active-btn" : ""}
          onClick={() => setActiveTab("resume")}
        >
          Resume
        </button>
      </div>

      {/* Main Content */}
      <div className="student-main-content">
        {activeTab === "profile" && <StudentProfile />}
        {activeTab === "resume" && <StudentResume />}
        {activeTab === "drives" && <StudentDrives />}

      </div>

    </div>
  );
}

export default StudentDashboard;