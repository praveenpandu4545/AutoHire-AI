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
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

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

  // Unique values for filters
  const drives = ["All", ...new Set(interviews.map(i => i.driveName))];
  const rounds = ["All", ...new Set(interviews.map(i => i.roundNumber))];

  // Filtering Logic
  const filteredInterviews = useMemo(() => {
    return interviews.filter((interview) => {
      const interviewDate = new Date(interview.startTime);

      const matchesSearch =
        interview.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        interview.studentEmail.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesDrive =
        selectedDrive === "All" || interview.driveName === selectedDrive;

      const matchesRound =
        selectedRound === "All" ||
        interview.roundNumber === Number(selectedRound);

      let matchesDateRange = true;

      if (fromDate) {
        matchesDateRange =
          matchesDateRange &&
          interviewDate >= new Date(fromDate);
      }

      if (toDate) {
        const endOfDay = new Date(toDate);
        endOfDay.setHours(23, 59, 59, 999);
        matchesDateRange =
          matchesDateRange &&
          interviewDate <= endOfDay;
      }

      return (
        matchesSearch &&
        matchesDrive &&
        matchesRound &&
        matchesDateRange
      );
    });
  }, [
    interviews,
    searchTerm,
    selectedDrive,
    selectedRound,
    fromDate,
    toDate,
  ]);

  const handleReview = (interview) => {
    console.log("Review interview:", interview);
    // You can navigate to review page here
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedDrive("All");
    setSelectedRound("All");
    setFromDate("");
    setToDate("");
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

        <button className="clear-btn" onClick={clearFilters}>
          Clear
        </button>

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
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {filteredInterviews.map((interview, index) => (
                <tr key={index}>
                  <td>{interview.driveName}</td>
                  <td>{interview.studentName}</td>
                  <td>{interview.studentEmail}</td>
                  <td>Round {interview.roundNumber}</td>
                  <td>
                    {new Date(interview.startTime).toLocaleString()}
                  </td>
                  <td>
                    <button
                      className="review-btn"
                      onClick={() => handleReview(interview)}
                    >
                      Review
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

    </div>
  );
};

export default PanelInterviews;