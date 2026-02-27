import { useState } from "react";
import { useNavigate } from "react-router-dom";
import HrProfile from "../HR/HrProfile";
import PanelInterviews from "./PanelInterviews";
import "../../css/PanelDashboard.css";

function PanelDashboard() {
  const [activeTab, setActiveTab] = useState("profile");
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <div className="panel-dashboard-container">

      {/* Sidebar */}
      <div className="panel-sidebar">
        <h2>Panel Dashboard</h2>

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

      </div>

      {/* Main Content */}
      <div className="panel-main-content">
        {activeTab === "profile" && <HrProfile />}
        {activeTab === "interviews" && <PanelInterviews/>}
      </div>

    </div>
  );
}

export default PanelDashboard;