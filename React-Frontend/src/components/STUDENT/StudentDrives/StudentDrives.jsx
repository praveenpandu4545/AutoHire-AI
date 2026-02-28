// src/components/student/StudentDrives/StudentDrives.jsx

import React, { useEffect, useState } from "react";
import "../../../css/StudentDrives.css";

import DriveList from "./DriveList";
import ApplicationView from "./ApplicationView";
import ConfirmView from "./ConfirmView";

const StudentDrives = () => {
  const BASE_URL = import.meta.env.VITE_SPRING_API_BASE_URL;
  const token = localStorage.getItem("token");

  const [drives, setDrives] = useState([]);
  const [selectedDrive, setSelectedDrive] = useState(null);
  const [mode, setMode] = useState("list");
  const [detailsDriveId, setDetailsDriveId] = useState(null);
  const [isRegistered, setIsRegistered] = useState(null);
  const [rounds, setRounds] = useState([]);
  const [loading, setLoading] = useState(true);

  const [hasResume, setHasResume] = useState(false);
  const [aiResult, setAiResult] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    fetchDrives();
  }, []);

  const fetchDrives = async () => {
    try {
      const response = await fetch(
        `${BASE_URL}/springApi/drive/student`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (!response.ok) throw new Error("Failed to fetch drives");

      const data = await response.json();
      setDrives(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleDetails = (driveId) => {
    setDetailsDriveId(detailsDriveId === driveId ? null : driveId);
  };

  const handleMyApplication = async (drive) => {
    try {
      const checkResponse = await fetch(
        `${BASE_URL}/springApi/myapplication/isRegistered/${drive.id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (!checkResponse.ok)
        throw new Error("Registration check failed");

      const checkData = await checkResponse.json();

      setSelectedDrive(drive);
      setIsRegistered(checkData.registered);

      if (checkData.registered) {
        const roundsResponse = await fetch(
          `${BASE_URL}/springApi/student/getAllRounds/${drive.id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (!roundsResponse.ok) {
          const text = await roundsResponse.text();
          throw new Error(text);
        }

        const roundsData = await roundsResponse.json();

        // 🔥 Important: Ensure interviewScheduled default false if missing
        const enhancedRounds = roundsData.map((r) => ({
          ...r,
          interviewScheduled: r.interviewScheduled || false,
        }));

        setRounds(enhancedRounds);
      }

      setMode("application");
    } catch (error) {
      console.error(error);
      alert(error.message);
    }
  };

  const handleRegisterClick = async () => {
    try {
      const response = await fetch(
        `${BASE_URL}/springApi/student/resume/hasResume`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const data = await response.json();
      setHasResume(data.hasResume);
      setMode("confirm");
      setAiResult(null);
    } catch (error) {
      console.error(error);
    }
  };

  const handleAiCheck = async () => {
  try {
    setAiLoading(true);

    const response = await fetch(
      `${BASE_URL}/springApi/ai/check/${selectedDrive.id}`,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.message || "AI check failed");
    }

    setAiResult(data.data);

  } catch (error) {
    console.error(error);
    alert(error.message);
  } finally {
    setAiLoading(false);
  }
};

  const handleFinalRegister = async () => {
    try {
      await fetch(
        `${BASE_URL}/springApi/myapplication/register/${selectedDrive.id}`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const roundsResponse = await fetch(
        `${BASE_URL}/springApi/student/getAllRounds/${selectedDrive.id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const roundsData = await roundsResponse.json();

      const enhancedRounds = roundsData.map((r) => ({
        ...r,
        interviewScheduled: r.interviewScheduled || false,
      }));

      setIsRegistered(true);
      setRounds(enhancedRounds);
      setMode("application");
      setAiResult(null);
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) return <div className="container">Loading drives...</div>;

  return (
    <div className="container">
      {mode === "list" && (
        <DriveList
          drives={drives}
          toggleDetails={toggleDetails}
          detailsDriveId={detailsDriveId}
          handleMyApplication={handleMyApplication}
        />
      )}

      {mode === "application" && (
        <ApplicationView
          selectedDrive={selectedDrive}
          isRegistered={isRegistered}
          rounds={rounds}
          setMode={setMode}
          handleRegisterClick={handleRegisterClick}
        />
      )}

      {mode === "confirm" && (
        <ConfirmView
          selectedDrive={selectedDrive}
          hasResume={hasResume}
          aiResult={aiResult}
          aiLoading={aiLoading}
          handleAiCheck={handleAiCheck}
          handleFinalRegister={handleFinalRegister}
          setMode={setMode}
        />
      )}
    </div>
  );
};

export default StudentDrives;