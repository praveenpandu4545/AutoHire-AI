import React, { useEffect, useState } from "react";
import "../../../css/StudentDrives.css";
import DriveList from "./DriveList";

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

  const [currentStep, setCurrentStep] = useState(1);

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
    const res = await fetch(
      `${BASE_URL}/springApi/myapplication/isRegistered/${drive.id}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    const data = await res.json();

    setSelectedDrive(drive);
    setIsRegistered(data.registered);
    setAiResult(null);
    setHasResume(false);
    setRounds([]);

    if (data.registered) {
      const roundsRes = await fetch(
        `${BASE_URL}/springApi/student/getAllRounds/${drive.id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const roundsData = await roundsRes.json();

      setRounds(roundsData);
      setCurrentStep(5);
    } else {
      setCurrentStep(1);
    }

    setMode("application");
  };

  const handleRegisterClick = async () => {
    const res = await fetch(
      `${BASE_URL}/springApi/student/resume/hasResume`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    const data = await res.json();

    setHasResume(data.hasResume);
    setCurrentStep(2);
    setMode("confirm");
  };

  const handleAiCheck = async () => {
    setAiLoading(true);

    const res = await fetch(
      `${BASE_URL}/springApi/ai/check/${selectedDrive.id}`,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    const data = await res.json();

    const parsed = JSON.parse(data.data);

    setAiResult(parsed);
    setCurrentStep(4);
    setAiLoading(false);
  };

  const handleFinalRegister = async () => {
    await fetch(
      `${BASE_URL}/springApi/myapplication/register/${selectedDrive.id}`,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    const roundsRes = await fetch(
      `${BASE_URL}/springApi/student/getAllRounds/${selectedDrive.id}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    const roundsData = await roundsRes.json();

    setRounds(roundsData);
    setIsRegistered(true);
    setCurrentStep(5);
  };

  if (loading) return <div className="container">Loading...</div>;

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

      {(mode === "application" || mode === "confirm") && (
        <div>
          <h2>{selectedDrive.driveName} - Application Flow</h2>

          <div className="stepper-container">

            {/* STEP 1 (ONLY FOR NOT REGISTERED USERS) */}
            {!isRegistered && (
              <div className="step-card">
                <h3>Step 1: Registration</h3>

                <p className="not-registered">
                  Not registered for this drive
                </p>

                <button onClick={handleRegisterClick}>
                  Start Registration
                </button>
              </div>
            )}

            {/* STEP 2 */}
            {!isRegistered && currentStep >= 2 && (
              <div className="step-card">
                <h3>Step 2: Resume Check</h3>
                <p>
                  Resume: {hasResume ? "✅ Uploaded" : "❌ Not Uploaded"}
                </p>
              </div>
            )}

            {/* STEP 3 (ALWAYS STAYS) */}
            {!isRegistered && hasResume && currentStep >= 2 && (
              <div className="step-card">
                <h3>Step 3: AI Check</h3>

                {!aiResult && (
                  <button onClick={handleAiCheck}>Run AI Check</button>
                )}

                {aiLoading && <p>Running AI...</p>}
              </div>
            )}

            {/* STEP 4 (SIDE BY SIDE) */}
            {!isRegistered && aiResult && (
              <div className="step-card result-card">
                <h3>Step 4: Result</h3>

                <h4>Score: {aiResult.percentage}%</h4>
                <p className="eligible">Eligible ✅</p>

                {aiResult.analysis?.strengths?.length > 0 && (
                  <>
                    <h4>Strengths:</h4>
                    <ul>
                      {aiResult.analysis.strengths.map((s, i) => (
                        <li key={i}>{s}</li>
                      ))}
                    </ul>
                  </>
                )}

                {aiResult.analysis?.weaknesses?.length > 0 && (
                  <>
                    <h4>Areas of Improvement:</h4>
                    <ul>
                      {aiResult.analysis.weaknesses.map((w, i) => (
                        <li key={i}>{w}</li>
                      ))}
                    </ul>
                  </>
                )}

                {aiResult.analysis?.improvements?.length > 0 && (
                  <>
                    <h4>Recommended Actions:</h4>
                    <ul>
                      {aiResult.analysis.improvements.map((r, i) => (
                        <li key={i}>{r}</li>
                      ))}
                    </ul>
                  </>
                )}

                <button onClick={handleFinalRegister}>Register</button>
              </div>
            )}

            {/* STEP 5 */}
            {currentStep === 5 && (
              <div className="step-card">
                <h3>Your Rounds</h3>
                {rounds.map((round) => (
                  <div key={round.id} className="round-box">
                    <div className="round-title">
                      Round {round.roundNumber}: {round.roundName}
                    </div>
                    <div className={`status ${round.status}`}>
                      {round.status}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button
            className="back-button"
            onClick={() => setMode("list")}
          >
            Back to Drives
          </button>
        </div>
      )}
    </div>
  );
};

export default StudentDrives;