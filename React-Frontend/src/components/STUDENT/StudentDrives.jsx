import React, { useEffect, useState } from "react";
import "../../css/StudentDrives.css";

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

      const checkData = await checkResponse.json();

      setSelectedDrive(drive);
      setIsRegistered(checkData.registered);

      if (checkData.registered) {
        const roundsResponse = await fetch(
          `${BASE_URL}/springApi/student/getAllRounds/${drive.id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const roundsData = await roundsResponse.json();
        setRounds(roundsData);
      }

      setMode("application");
    } catch (error) {
      console.error(error);
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
      setAiResult(data);
      setAiLoading(false);

    } catch (error) {
      console.error(error);
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

      setIsRegistered(true);
      setRounds(roundsData);
      setMode("application");
      setAiResult(null);

    } catch (error) {
      console.error(error);
    }
  };

  if (loading) return <div className="container">Loading drives...</div>;

  return (
    <div className="container">

      {/* ================= CONFIRM SCREEN ================= */}
      {mode === "confirm" && (
        <>
          <h2>{selectedDrive.driveName} - AI Check</h2>

          <div className="confirm-box">
            <p>
              Resume Uploaded: {hasResume ? "✅ Uploaded" : "❌ Not Uploaded"}
            </p>

            {!hasResume && (
              <>
                <p className="resume-warning">
                  Please upload your resume before registering.
                </p>
                <button onClick={() => setMode("application")}>
                  Back
                </button>
              </>
            )}

            {hasResume && !aiResult && (
              <>
                <hr />
                <p>
                  You have to go through our AI Checkup before registering.
                </p>
                <div className="button-group">
                  <button onClick={handleAiCheck}>
                    Run AI Check
                  </button>
                  <button
                    className="back-button"
                    onClick={() => setMode("application")}
                  >
                    Cancel
                  </button>
                </div>
              </>
            )}

            {aiLoading && <p>Running AI Analysis...</p>}

            {aiResult && (
              <div className="ai-result-box">

                {/* STRICT ELIGIBILITY FAILED */}
                {!aiResult.eligible && (
                  <>
                    <p className="not-eligible">❌ Not Eligible</p>

                    {aiResult.reasons && (
                      <ul>
                        {aiResult.reasons.map((reason, index) => (
                          <li key={index}>{reason}</li>
                        ))}
                      </ul>
                    )}

                    <button
                      className="back-button"
                      onClick={() => setMode("application")}
                    >
                      Back
                    </button>
                  </>
                )}

                {/* STRICT ELIGIBILITY PASSED */}
                {aiResult.eligible && (
                  <>
                    <h3>Suitability: {aiResult.percentage}%</h3>
                    <p className="eligible">Eligible ✅</p>

                    {aiResult.missing_skills &&
                      aiResult.missing_skills.length > 0 && (
                        <>
                          <p>Missing Skills:</p>
                          <ul>
                            {aiResult.missing_skills.map((skill, index) => (
                              <li key={index}>{skill}</li>
                            ))}
                          </ul>
                        </>
                      )}

                    <button onClick={handleFinalRegister}>
                      Register
                    </button>
                  </>
                )}

              </div>
            )}
          </div>
        </>
      )}

      {/* ================= APPLICATION SCREEN ================= */}
      {mode === "application" && (
        <>
          <h2>{selectedDrive.driveName} - My Application</h2>

          {!isRegistered ? (
            <>
              <p>You are not registered for this drive.</p>
              <button onClick={handleRegisterClick}>
                Register
              </button>
            </>
          ) : (
            <>
              <h3>Your Round Status</h3>
              {rounds
                .sort((a, b) => a.roundNumber - b.roundNumber)
                .map((round) => (
                  <div key={round.id} className="round-box">
                    <strong>
                      Round {round.roundNumber}: {round.roundName}
                    </strong>
                    <div className={`status ${round.status}`}>
                      {round.status}
                    </div>
                  </div>
                ))}
            </>
          )}

          <button
            className="back-button"
            onClick={() => {
              setMode("list");
              setSelectedDrive(null);
              setRounds([]);
              setIsRegistered(null);
            }}
          >
            Back to Drives
          </button>
        </>
      )}

      {/* ================= DRIVE LIST ================= */}
      {mode === "list" && (
        <>
          <h2>Available Drives</h2>

          {drives.map((drive) => (
            <div key={drive.id} className="drive-card">
              <div className="drive-title">{drive.driveName}</div>

              <div className="button-group">
                <button onClick={() => toggleDetails(drive.id)}>
                  View Details
                </button>
                <button onClick={() => handleMyApplication(drive)}>
                  My Application
                </button>
              </div>

              {detailsDriveId === drive.id && (
                <div className="details-box">
                  <p><strong>No of Rounds:</strong> {drive.noOfRounds}</p>
                  <p><strong>Required Skills:</strong></p>
                  <ul>
                    {drive.requiredSkills?.map((skill, index) => (
                      <li key={index}>{skill}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </>
      )}
    </div>
  );
};

export default StudentDrives;