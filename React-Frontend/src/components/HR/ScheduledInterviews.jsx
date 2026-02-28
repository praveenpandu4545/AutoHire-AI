// src/components/hr/ScheduledInterviews.jsx

import React, { useEffect, useMemo, useState } from "react";
import "../../css/ScheduledInterviews.css";

const ScheduledInterviews = () => {
  const BASE_URL = import.meta.env.VITE_SPRING_API_BASE_URL;
  const token = localStorage.getItem("token");

  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🔍 Global Search
  const [search, setSearch] = useState("");

  // 🎯 Column Filters
  const [collegeFilter, setCollegeFilter] = useState("");
  const [driveFilter, setDriveFilter] = useState("");
  const [panelFilter, setPanelFilter] = useState("");

  // 📅 Date Range Filter
  const [startRange, setStartRange] = useState("");
  const [endRange, setEndRange] = useState("");

  useEffect(() => {
    fetchInterviews();
  }, []);

  const fetchInterviews = async () => {
    try {
      const response = await fetch(
        `${BASE_URL}/springApi/interviews/hr`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch interviews");
      }

      const data = await response.json();
      setInterviews(data);
    } catch (err) {
      console.error(err);
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (dateTime) => {
    if (!dateTime) return "";
    return new Date(dateTime).toLocaleString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // 🔥 Unique dropdown values
  const uniqueColleges = useMemo(
    () =>
      [...new Set(interviews.map((i) => i.collegeName?.trim()))].filter(Boolean),
    [interviews]
  );

  const uniqueDrives = useMemo(
    () =>
      [...new Set(interviews.map((i) => i.driveName?.trim()))].filter(Boolean),
    [interviews]
  );

  const uniquePanels = useMemo(
    () =>
      [...new Set(interviews.map((i) => i.panelMemberName?.trim()))].filter(Boolean),
    [interviews]
  );

  // 🔥 Enterprise-safe filtering logic
  const filteredInterviews = interviews.filter((interview) => {
    const searchLower = search.toLowerCase().trim();

    const studentName = String(interview.studentName || "")
      .toLowerCase()
      .trim();
    const studentEmail = String(interview.studentEmail || "")
      .toLowerCase()
      .trim();
    const driveName = String(interview.driveName || "")
      .toLowerCase()
      .trim();
    const collegeName = String(interview.collegeName || "")
      .toLowerCase()
      .trim();
    const panelName = String(interview.panelMemberName || "")
      .toLowerCase()
      .trim();

    // 🔍 Global Search (numbers safe)
    const matchesSearch =
      studentName.includes(searchLower) ||
      studentEmail.includes(searchLower) ||
      driveName.includes(searchLower) ||
      collegeName.includes(searchLower) ||
      panelName.includes(searchLower);

    // 🎯 Filters (case-insensitive)
    const matchesCollege =
      !collegeFilter ||
      collegeName === collegeFilter.toLowerCase().trim();

    const matchesDrive =
      !driveFilter ||
      driveName === driveFilter.toLowerCase().trim();

    const matchesPanel =
      !panelFilter ||
      panelName === panelFilter.toLowerCase().trim();

    // 📅 Date filtering
    const interviewDate = new Date(interview.startTime);

    const matchesStartRange =
      !startRange || interviewDate >= new Date(startRange);

    const matchesEndRange =
      !endRange || interviewDate <= new Date(endRange);

    return (
      matchesSearch &&
      matchesCollege &&
      matchesDrive &&
      matchesPanel &&
      matchesStartRange &&
      matchesEndRange
    );
  });

  if (loading) {
    return <div className="scheduled-container">Loading interviews...</div>;
  }

  return (
    <div className="scheduled-container">
      <div className="scheduled-header">
        <h2>Scheduled Interviews</h2>

        <input
          type="text"
          placeholder="Search student, email, drive, panel..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="global-search"
        />
      </div>

      {/* 📅 Date Range */}
      <div className="date-filter-bar">
        <label>From:</label>
        <input
          type="datetime-local"
          value={startRange}
          onChange={(e) => setStartRange(e.target.value)}
        />

        <label>To:</label>
        <input
          type="datetime-local"
          value={endRange}
          onChange={(e) => setEndRange(e.target.value)}
        />
      </div>

      <div className="table-wrapper">
        <table className="scheduled-table">
          <thead>
            <tr>
              <th>
                College
                <select
                  value={collegeFilter}
                  onChange={(e) => setCollegeFilter(e.target.value)}
                >
                  <option value="">All</option>
                  {uniqueColleges.map((c, i) => (
                    <option key={i} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </th>

              <th>
                Drive
                <select
                  value={driveFilter}
                  onChange={(e) => setDriveFilter(e.target.value)}
                >
                  <option value="">All</option>
                  {uniqueDrives.map((d, i) => (
                    <option key={i} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </th>

              <th>Student</th>
              <th>Email</th>
              <th>Round</th>

              <th>
                Panel
                <select
                  value={panelFilter}
                  onChange={(e) => setPanelFilter(e.target.value)}
                >
                  <option value="">All</option>
                  {uniquePanels.map((p, i) => (
                    <option key={i} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </th>

              <th>Date & Time</th>
            </tr>
          </thead>

          <tbody>
            {filteredInterviews.length === 0 ? (
              <tr>
                <td colSpan="7" className="no-data">
                  No interviews found.
                </td>
              </tr>
            ) : (
              filteredInterviews.map((interview, index) => (
                <tr key={index}>
                  <td>{interview.collegeName}</td>
                  <td>{interview.driveName}</td>
                  <td>{interview.studentName}</td>
                  <td>{interview.studentEmail}</td>
                  <td>{interview.roundNumber}</td>
                  <td>{interview.panelMemberName}</td>
                  <td>{formatDateTime(interview.startTime)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ScheduledInterviews;