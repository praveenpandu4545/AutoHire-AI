import React, { useEffect, useState } from "react";
import "../../css/AllDrives.css";

const StudentRounds = ({ studentId, driveId, onBack, refreshStudents }) => {
  const BASE_URL = import.meta.env.VITE_SPRING_API_BASE_URL;

  const [rounds, setRounds] = useState([]);
  const [loadingRounds, setLoadingRounds] = useState(false);

  const [panelMembers, setPanelMembers] = useState([]);
  const [selectedRoundId, setSelectedRoundId] = useState(null);
  const [panelMemberId, setPanelMemberId] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  // NEW STATE FOR REVIEW MODAL
  const [selectedReview, setSelectedReview] = useState(null);

  useEffect(() => {
    fetchRounds();
    fetchPanelMembers();
  }, [studentId]);

  // =============================
  // FETCH ROUNDS
  // =============================
  const fetchRounds = async () => {
    try {
      setLoadingRounds(true);
      const token = localStorage.getItem("token");

      const response = await fetch(
        `${BASE_URL}/springApi/student/getAllRounds/${studentId}/driveId/${driveId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const data = await response.json();

      const uniqueRounds = Array.from(
        new Map(data.map((r) => [r.roundNumber, r])).values()
      );

      setRounds(uniqueRounds);
      setLoadingRounds(false);
    } catch (error) {
      console.error(error);
      setLoadingRounds(false);
    }
  };

  // =============================
  // FETCH PANEL MEMBERS
  // =============================
  const fetchPanelMembers = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        `${BASE_URL}/springApi/employees/panel-members`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const data = await response.json();
      setPanelMembers(data);
    } catch (error) {
      console.error(error);
    }
  };

  // =============================
  // UPDATE ROUND STATUS
  // =============================
  const updateStatus = async (roundId, status) => {
    try {
      const token = localStorage.getItem("token");

      await fetch(
        `${BASE_URL}/springApi/student-round-status/${roundId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status }),
        }
      );

      fetchRounds();
      refreshStudents();
    } catch (error) {
      console.error(error);
    }
  };

  // =============================
  // SCHEDULE INTERVIEW
  // =============================
  const scheduleInterview = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        `${BASE_URL}/springApi/interviews/schedule`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            studentId,
            roundId: selectedRoundId,
            panelMemberId,
            startTime,
            endTime,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        alert(result.message || "Scheduling failed ❌");
        return;
      }

      alert("Interview Scheduled Successfully ✅");

      setSelectedRoundId(null);
      setPanelMemberId("");
      setStartTime("");
      setEndTime("");

      fetchRounds();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="all-drives-container">
      <h2>Student Round Details</h2>

      <button className="back-btn" onClick={onBack}>
        ← Back to Students
      </button>

      {loadingRounds ? (
        <p>Loading rounds...</p>
      ) : (
        <table className="students-table">
          <thead>
            <tr>
              <th>Round</th>
              <th>Round Name</th>
              <th>Status</th>
              <th>Update</th>
              <th>Interview</th>
              <th>Panel Review</th>
            </tr>
          </thead>

          <tbody>
            {rounds.map((round) => (
              <React.Fragment key={round.id}>
                <tr>
                  <td>{round.roundNumber}</td>
                  <td>{round.roundName}</td>
                  <td>{round.status}</td>

                  {/* STATUS UPDATE */}
                  <td>
                    <select
                      value={round.status}
                      onChange={(e) =>
                        updateStatus(round.id, e.target.value)
                      }
                    >
                      <option value="IN PROGRESS">IN PROGRESS</option>
                      <option value="SELECTED">SELECTED</option>
                      <option value="REJECTED">REJECTED</option>
                    </select>
                  </td>

                  {/* INTERVIEW */}
                  <td>
                    {round.interviewScheduled ? (
                      <div style={{ color: "green", fontWeight: "bold" }}>
                        Scheduled
                        <div style={{ fontSize: "12px", color: "#555" }}>
                          {round.panelName && (
                            <>
                              Panel: {round.panelName} <br />
                            </>
                          )}
                          {round.interviewStartTime &&
                            round.interviewStartTime.replace("T", " ")}
                        </div>
                      </div>
                    ) : (
                      <button
                        className="details-btn"
                        onClick={() => setSelectedRoundId(round.id)}
                      >
                        Schedule
                      </button>
                    )}
                  </td>

                  {/* PANEL REVIEW */}
                  <td>
                    {round.panelReview ? (
                      <button
                        className="details-btn"
                        onClick={() => setSelectedReview(round)}
                      >
                        View Review
                      </button>
                    ) : (
                      <span style={{ color: "#999" }}>Pending</span>
                    )}
                  </td>
                </tr>

                {/* INLINE SCHEDULE FORM */}
                {selectedRoundId === round.id && !round.interviewScheduled && (
                  <tr>
                    <td colSpan="6">
                      <div
                        style={{
                          padding: "15px",
                          background: "#f4f6f9",
                          borderRadius: "8px",
                          display: "flex",
                          gap: "10px",
                          alignItems: "center",
                          flexWrap: "wrap",
                        }}
                      >
                        <select
                          value={panelMemberId}
                          onChange={(e) => setPanelMemberId(e.target.value)}
                        >
                          <option value="">Select Panel</option>
                          {panelMembers.map((panel) => (
                            <option key={panel.id} value={panel.id}>
                              {panel.name}
                            </option>
                          ))}
                        </select>

                        <input
                          type="datetime-local"
                          value={startTime}
                          onChange={(e) => setStartTime(e.target.value)}
                        />

                        <input
                          type="datetime-local"
                          value={endTime}
                          onChange={(e) => setEndTime(e.target.value)}
                        />

                        <button
                          className="upload-btn"
                          onClick={scheduleInterview}
                        >
                          Confirm
                        </button>

                        <button
                          className="back-btn"
                          onClick={() => setSelectedRoundId(null)}
                        >
                          Cancel
                        </button>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      )}

      {/* =============================
         REVIEW MODAL CARD
      ============================= */}

      {selectedReview && (
        <div className="review-modal">
          <div className="review-card-large">

            <span
              className="close-review"
              onClick={() => setSelectedReview(null)}
            >
              ❌
            </span>

            <h2 style={{ color: "green" }}>✔ Interview Completed</h2>

            <h3>Panel Review</h3>

            <p style={{ marginTop: "10px", lineHeight: "1.6" }}>
              {selectedReview.panelReview}
            </p>

          </div>
        </div>
      )}
    </div>
  );
};

export default StudentRounds;