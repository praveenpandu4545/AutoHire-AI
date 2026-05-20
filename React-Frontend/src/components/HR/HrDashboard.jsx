import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import UserProfile from "./HrProfile";
import CreateDrive from "./CreateDrive";
import AddCollege from "./AddCollege";
import AllColleges from "./AllColleges";
import AllDrives from "./AllDrives";
import ScheduledInterviews from "./ScheduledInterviews";
import ChatMessages from "./ChatMessages";
import Assesments from "./Assesments";
import CreateNotice from "./CreateNotice";
import "../../css/Dashboard.css";

const HrDashboard = () => {
  const [activeTab, setActiveTab] = useState("profile");
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/");
    }
  }, []);

  const renderContent = () => {
    switch (activeTab) {
      case "profile":
        return <UserProfile />;
      case "createDrive":
        return <CreateDrive/>;
      case "addCollege":
        return <AddCollege/>;  
      case "showClgs":
        return <AllColleges/>;  
      case "showDrives":
        return <AllDrives/>;  
      case "scheduledInterviews":
        return <ScheduledInterviews/>  
      case "chatMessages":
        return <ChatMessages/>
      case "Assesments":
        return <Assesments/>  
      case "CreateNotice":
        return <CreateNotice/>  
      default:
        return <div>Select an option</div>;
    }
  };

  return (
    <div className="dashboard-container">
      <aside className="sidebar">
        <div className="sidebar-header">
          <p className="sidebar-kicker">Operations</p>
          <h2 className="logo">HR Dashboard</h2>
        </div>

        <button
          className={activeTab === "profile" ? "active" : ""}
          onClick={() => setActiveTab("profile")}
        >
          Profile
        </button>

        <button
          className={activeTab === "showDrives" ? "active" : ""}
          onClick={() => setActiveTab("showDrives")}
        >
          Drive's
        </button>

        <button
          className={activeTab === "createDrive" ? "active" : ""}
          onClick={() => setActiveTab("createDrive")}
        >
          Set up a Drive
        </button>

        <button
          className={activeTab === "addCollege" ? "active" : ""}
          onClick={() => setActiveTab("addCollege")}
        >
          Add New College
        </button>

        <button
          className={activeTab === "showClgs" ? "active" : ""}
          onClick={() => setActiveTab("showClgs")}
        >
          College's
        </button>

        <button
          className={activeTab === "scheduledInterviews" ? "active" : ""}
          onClick={() => setActiveTab("scheduledInterviews")}
        >
          Scheduled Interviews
        </button>

        <button
          className={activeTab === "chatMessages" ? "active" : ""}
          onClick={() => setActiveTab("chatMessages")}
        >
          Messages
        </button>

        <button
          className={activeTab === "Assesments" ? "active" : ""}
          onClick={() => setActiveTab("Assesments")}
        >
          Assesments
        </button>

        <button
          className={activeTab === "CreateNotice" ? "active" : ""}
          onClick={() => setActiveTab("CreateNotice")}
        >
          Create Notice
        </button>
      </aside>

      <div className="content">
        {renderContent()}
      </div>
    </div>
  );
};

export default HrDashboard;