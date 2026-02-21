import React, { useEffect, useState } from "react";
import "../css/AllDrives.css";

const StudentRounds = ({ studentId, driveId, onBack, refreshStudents }) => {
  const BASE_URL = import.meta.env.VITE_SPRING_API_BASE_URL;

  const [rounds, setRounds] = useState([]);
  const [loadingRounds, setLoadingRounds] = useState(false);

  useEffect(() => {
    fetchRounds();
  }, [studentId]);

  const fetchRounds = async () => {
    try {
      setLoadingRounds(true);
      const token = localStorage.getItem("token");

      const response = await fetch(
        `${BASE_URL}/springApi/student/getAllRounds/${studentId}/driveId/${driveId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const data = await response.json();
      setRounds(data);
      setLoadingRounds(false);

    } catch (error) {
      console.error(error);
      setLoadingRounds(false);
    }
  };

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
            </tr>
          </thead>
          <tbody>
            {rounds.map((round) => (
              <tr key={round.id}>
                <td>{round.roundNumber}</td>
                <td>{round.roundName}</td>
                <td>{round.status}</td>
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
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default StudentRounds;