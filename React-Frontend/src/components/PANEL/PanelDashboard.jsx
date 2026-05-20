import { useState } from "react";
import HrProfile from "../HR/HrProfile";
import PanelInterviews from "./PanelInterviews";
import ContactHR from "../STUDENT/ContactHR"
import NoticeBoard from "../NoticeBoard";
import "../../css/PanelDashboard.css";

function PanelDashboard() {
  const [activeTab, setActiveTab] = useState("profile");

  return (
    <div className="panel-dashboard-container">

      {/* Sidebar */}
      <aside className="panel-sidebar">
        <div className="panel-sidebar-header">
          <p className="panel-sidebar-kicker">Workspace</p>
          <h2>Panel Dashboard</h2>
        </div>

        <button
          className={activeTab === "profile" ? "active-btn" : ""}
          onClick={() => setActiveTab("profile")}
        >
          Profile
        </button>

        <button
          className={activeTab === "interviews" ? "active-btn" : ""}
          onClick={() => setActiveTab("interviews")}
        >
          Scheduled Interviews 
        </button>

        <button
          className={activeTab === "ContactHR" ? "active-btn" : ""}
          onClick={() => setActiveTab("ContactHR")}
        >
          Contact HR 
        </button>

        <button
          className={activeTab === "NoticeBoard" ? "active-btn" : ""}
          onClick={() => setActiveTab("NoticeBoard")}
        >
          Notice Board
        </button>

      </aside>

      {/* Main Content */}
      <div className="panel-main-content">
        {activeTab === "profile" && <HrProfile />}
        {activeTab === "interviews" && <PanelInterviews/>}
        {activeTab === "ContactHR" && <ContactHR/>}
        {activeTab === "NoticeBoard" && <NoticeBoard/>}
      </div>

    </div>
  );
}

export default PanelDashboard;