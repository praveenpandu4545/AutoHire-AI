import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import UserProfile from "./HrProfile";
import CreateDrive from "./CreateDrive";
import AddCollege from "./AddCollege";
import AllColleges from "./AllColleges";
import AllDrives from "./AllDrives";
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
      default:
        return <div>Select an option</div>;
    }
  };

  return (
    <div className="dashboard-container">
      <div className="sidebar">
        <h2 className="logo">HR Dashboard</h2>

        <button onClick={() => setActiveTab("profile")}>
          Profile
        </button>

        <button onClick={() => setActiveTab("showDrives")}>
          Drive's
        </button>

        <button onClick={() => setActiveTab("createDrive")}>
          Set up a Drive
        </button>

        <button onClick={() => setActiveTab("addCollege")}>
          Add New College
        </button>

        <button onClick={() => setActiveTab("showClgs")}>
          College's
        </button>

        

        

        
      </div>

      <div className="content">
        {renderContent()}
      </div>
    </div>
  );
};

export default HrDashboard;