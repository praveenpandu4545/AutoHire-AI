import React, { useEffect, useState, useMemo } from "react";
import "../../css/PanelInterviews.css";

const PanelInterviews = () => {
  const BASE_URL = import.meta.env.VITE_SPRING_API_BASE_URL;

  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDrive, setSelectedDrive] = useState("All");
  const [selectedRound, setSelectedRound] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");   // NEW
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const [selectedInterview, setSelectedInterview] = useState(null);
  const [reviewText, setReviewText] = useState("");

  useEffect(() => {
    fetchInterviews();
  }, []);

  const fetchInterviews = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        `${BASE_URL}/springApi/interviews/panel-interviews`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch interviews");
      }

      const data = await response.json();
      setInterviews(data);
    } catch (err) {
      setError("Unable to load interviews.");
    } finally {
      setLoading(false);
    }
  };

  const startCall = async (interview) => {
      const token = localStorage.getItem("token");
      console.log("Interview object:", interview);
      await fetch(`${BASE_URL}/springApi/interviews/start`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          interviewId: interview.id,
          receiverId: interview.studentId, // dynamic
        }),
      });

      alert("Calling student...");
    };

  const drives = ["All", ...new Set(interviews.map((i) => i.driveName))];
  const rounds = ["All", ...new Set(interviews.map((i) => i.roundNumber))];

  const filteredInterviews = useMemo(() => {
    return interviews.filter((interview) => {
      const interviewDate = new Date(interview.startTime);

      const matchesSearch =
        interview.studentName
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        interview.studentEmail
          .toLowerCase()
          .includes(searchTerm.toLowerCase());

      const matchesDrive =
        selectedDrive === "All" || interview.driveName === selectedDrive;

      const matchesRound =
        selectedRound === "All" ||
        interview.roundNumber === Number(selectedRound);

      const status = interview.review ? "Completed" : "Pending";

      const matchesStatus =
        selectedStatus === "All" || status === selectedStatus;

      let matchesDateRange = true;

      if (fromDate) {
        matchesDateRange =
          matchesDateRange && interviewDate >= new Date(fromDate);
      }

      if (toDate) {
        const endOfDay = new Date(toDate);
        endOfDay.setHours(23, 59, 59, 999);

        matchesDateRange =
          matchesDateRange && interviewDate <= endOfDay;
      }

      return (
        matchesSearch &&
        matchesDrive &&
        matchesRound &&
        matchesStatus &&
        matchesDateRange
      );
    });
  }, [
    interviews,
    searchTerm,
    selectedDrive,
    selectedRound,
    selectedStatus,
    fromDate,
    toDate,
  ]);

  const handleReview = (interview) => {
    setSelectedInterview(interview);
    setReviewText(interview.review || "");
  };

  const submitReview = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        `${BASE_URL}/springApi/interviews/review`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            interviewScheduleId: selectedInterview.id,
            review: reviewText,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to submit review");
      }

      alert("Review submitted successfully");

      setInterviews((prev) =>
        prev.map((i) =>
          i.id === selectedInterview.id
            ? { ...i, review: reviewText }
            : i
        )
      );

      setSelectedInterview(null);
      setReviewText("");
    } catch (err) {
      alert("Error submitting review");
    }
  };

  return (
    <div className="panel-container">

      <div className="page-header">
        <h2>My Scheduled Interviews</h2>
      </div>

      {/* FILTER BAR */}
      <div className="filter-bar">

        <div className="filter-group">
          <label>Drive</label>
          <select
            value={selectedDrive}
            onChange={(e) => setSelectedDrive(e.target.value)}
          >
            {drives.map((drive, index) => (
              <option key={index} value={drive}>
                {drive}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label>Round</label>
          <select
            value={selectedRound}
            onChange={(e) => setSelectedRound(e.target.value)}
          >
            {rounds.map((round, index) => (
              <option key={index} value={round}>
                {round}
              </option>
            ))}
          </select>
        </div>

        {/* NEW STATUS FILTER */}
        <div className="filter-group">
          <label>Status</label>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
          >
            <option value="All">All</option>
            <option value="Completed">Completed</option>
            <option value="Pending">Pending</option>
          </select>
        </div>

        <div className="filter-group">
          <label>From</label>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
          />
        </div>

        <div className="filter-group">
          <label>To</label>
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
          />
        </div>

        <div className="search-group">
          <input
            type="text"
            placeholder="Search by student or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

      </div>

      {/* TABLE */}
      <div className="table-wrapper">
        {loading ? (
          <div className="loader">Loading interviews...</div>
        ) : error ? (
          <div className="error">{error}</div>
        ) : filteredInterviews.length === 0 ? (
          <div className="no-data">No interviews found</div>
        ) : (
          <table className="interview-table">

            <thead>
              <tr>
                <th>Drive</th>
                <th>Student</th>
                <th>Email</th>
                <th>Round</th>
                <th>Date & Time</th>
                <th>Status</th>
                <th>Drop Your Review</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {filteredInterviews.map((interview) => {
                const status = interview.review ? "Completed" : "Pending";

                return (
                  <tr key={interview.id}>
                    <td>{interview.driveName}</td>
                    <td>{interview.studentName}</td>
                    <td>{interview.studentEmail}</td>
                    <td>Round {interview.roundNumber}</td>
                    <td>{new Date(interview.startTime).toLocaleString()}</td>

                    {/* STATUS COLUMN */}
                    <td>
              <span
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  fontWeight: "600"
                }}
              >
                <span
                  style={{
                    width: "10px",
                    height: "10px",
                    borderRadius: "50%",
                    backgroundColor: status === "Completed" ? "green" : "orange",
                    animation: status === "Completed" ? "none" : "blink 1s infinite"
                  }}
                ></span>
                {status}
              </span>

              {/* Inline keyframes (must be included once in your component) */}
              <style>
                {`
                  @keyframes blink {
                    0% { opacity: 1; }
                    50% { opacity: 0.2; }
                    100% { opacity: 1; }
                  }
                `}
              </style>
            </td>

                    <td>
                      <button
                        className="review-btn"
                        onClick={() => handleReview(interview)}
                      >
                        {interview.review ? "Update" : "Review"}
                      </button>
                    </td>

                    <td>
                      <button onClick={() => startCall(interview)}>Call</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>

          </table>
        )}
      </div>

      {/* REVIEW POPUP */}
      {selectedInterview && (
        <div className="review-popup">

          <div className="review-card">

            <h3>Interview Review</h3>

            <p><b>Student:</b> {selectedInterview.studentName}</p>
            <p><b>Drive:</b> {selectedInterview.driveName}</p>

            {selectedInterview.review && (
              <div className="previous-review">
                <b>Previous Review:</b>
                <p>{selectedInterview.review}</p>
              </div>
            )}

            <textarea
              rows="5"
              placeholder="Write your feedback..."
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
            />

            <div className="review-actions">

              <button
                className="submit-review-btn"
                onClick={submitReview}
              >
                Submit
              </button>

              <button
                className="cancel-btn"
                onClick={() => setSelectedInterview(null)}
              >
                Cancel
              </button>

            </div>

          </div>

        </div>
      )}

    </div>
  );
};

export default PanelInterviews;