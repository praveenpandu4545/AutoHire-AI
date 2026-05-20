import { useState } from "react";
import StudentProfile from "./StudentProfile";
import StudentResume from "./StudentResume";
import StudentDrives from "./StudentDrives/StudentDrives";
import ContactHR from "./ContactHR";
import Assessments from "./Assessments";
import StudentVC from "./StudentVC";
import NoticeBoard from "../NoticeBoard";
import "../../css/StudentDashboard.css";

function StudentDashboard() {
  const [activeTab, setActiveTab] = useState("profile");

  return (
    <div className="student-dashboard-container">
      <aside className="student-sidebar">
        <div className="student-sidebar-header">
          <p className="student-sidebar-kicker">Workspace</p>
          <h2>Student Dashboard</h2>
        </div>

        <nav className="student-sidebar-nav">
        <button
          className={activeTab === "profile" ? "active-btn" : ""}
          onClick={() => setActiveTab("profile")}
        >
          <span>Profile</span>
        </button>

        <button
          className={activeTab === "drives" ? "active-btn" : ""}
          onClick={() => setActiveTab("drives")}
        >
          <span>Drives</span>
        </button>

        <button
          className={activeTab === "resume" ? "active-btn" : ""}
          onClick={() => setActiveTab("resume")}
        >
          <span>Resume</span>
        </button>

        <button
          className={activeTab === "hr" ? "active-btn" : ""}
          onClick={() => setActiveTab("hr")}
        >
          <span>Contact HR</span>
        </button>

        <button
          className={activeTab === "assessments" ? "active-btn" : ""}
          onClick={() => setActiveTab("assessments")}
        >
          <span>My Assessments</span>
        </button>

        <button
          className={activeTab === "videoCall" ? "active-btn" : ""}
          onClick={() => setActiveTab("videoCall")}
        >
          <span>Interview Calls</span>
        </button>

        <button
          className={activeTab === "NoticeBoard" ? "active-btn" : ""}
          onClick={() => setActiveTab("NoticeBoard")}
        >
          <span>Notice Board</span>
        </button>
        
        </nav>
      </aside>

      {/* Main Content */}
      <div className="student-main-content">
        {activeTab === "profile" && <StudentProfile />}
        {activeTab === "resume" && <StudentResume />}
        {activeTab === "drives" && <StudentDrives />}
        {activeTab === "hr" && <ContactHR />}
        {activeTab === "assessments" && <Assessments />}
        {activeTab === "videoCall" && <StudentVC />}
        {activeTab === "NoticeBoard" && <NoticeBoard />}


      </div>

    </div>
  );
}

export default StudentDashboard;