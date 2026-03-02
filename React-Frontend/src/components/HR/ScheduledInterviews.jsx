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
  const [roundFilter, setRoundFilter] = useState("");

  // 📅 Date Range Filter
  const [startRange, setStartRange] = useState("");
  const [endRange, setEndRange] = useState("");

  // 🔁 Reschedule States
  const [panelMembers, setPanelMembers] = useState([]);
  const [rescheduleId, setRescheduleId] = useState(null);
  const [newPanelMemberId, setNewPanelMemberId] = useState("");
  const [newStartTime, setNewStartTime] = useState("");
  const [newEndTime, setNewEndTime] = useState("");

  useEffect(() => {
    fetchInterviews();
    fetchPanelMembers();
  }, []);

  // =============================
  // FETCH INTERVIEWS
  // =============================
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

  // =============================
  // FETCH PANEL MEMBERS
  // =============================
  const fetchPanelMembers = async () => {
    try {
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
  // RESCHEDULE
  // =============================
  const rescheduleInterview = async (interviewId) => {
    try {
      const response = await fetch(
        `${BASE_URL}/springApi/interviews/${interviewId}/reschedule`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            panelMemberId: newPanelMemberId,
            startTime: newStartTime,
            endTime: newEndTime,
          }),
        }
      );

      const text = await response.text();
      let result;

      try {
        result = JSON.parse(text);
      } catch {
        result = { message: text };
      }

      if (!response.ok) {
        alert(result.message || "Rescheduling failed ❌");
        return;
      }

      alert("Interview Rescheduled Successfully ✅");

      setRescheduleId(null);
      setNewPanelMemberId("");
      setNewStartTime("");
      setNewEndTime("");

      fetchInterviews();
    } catch (error) {
      console.error(error);
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

  const formatForInput = (dateTime) => {
    if (!dateTime) return "";
    return dateTime.slice(0, 16);
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

  const uniqueRounds = useMemo(
    () =>
      [...new Set(interviews.map((i) => i.roundNumber))].filter(
        (r) => r !== undefined && r !== null
      ),
    [interviews]
  );

  // 🔥 Enterprise filtering logic
  const filteredInterviews = interviews.filter((interview) => {
    const searchLower = search.toLowerCase().trim();

    const studentName = interview.studentName?.toLowerCase().trim() || "";
    const studentEmail = interview.studentEmail?.toLowerCase().trim() || "";
    const driveName = interview.driveName?.toLowerCase().trim() || "";
    const collegeName = interview.collegeName?.toLowerCase().trim() || "";
    const panelName = interview.panelMemberName?.toLowerCase().trim() || "";

    const matchesSearch =
      studentName.includes(searchLower) ||
      studentEmail.includes(searchLower) ||
      driveName.includes(searchLower) ||
      collegeName.includes(searchLower) ||
      panelName.includes(searchLower);

    const matchesCollege =
      !collegeFilter ||
      collegeName === collegeFilter.toLowerCase().trim();

    const matchesDrive =
      !driveFilter ||
      driveName === driveFilter.toLowerCase().trim();

    const matchesPanel =
      !panelFilter ||
      panelName === panelFilter.toLowerCase().trim();

    const matchesRound =
      !roundFilter ||
      String(interview.roundNumber) === String(roundFilter);  

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
      matchesRound &&
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
                  {uniqueColleges.map((c) => (
                    <option key={c} value={c}>
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
                  {uniqueDrives.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </th>

              <th>Student</th>
              <th>Email</th>
              <th>
                  Round
                  <select
                    value={roundFilter}
                    onChange={(e) => setRoundFilter(e.target.value)}
                  >
                    <option value="">All</option>
                    {uniqueRounds.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </th>

              <th>
                Panel
                <select
                  value={panelFilter}
                  onChange={(e) => setPanelFilter(e.target.value)}
                >
                  <option value="">All</option>
                  {uniquePanels.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </th>

              <th>Date & Time</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {filteredInterviews.length === 0 ? (
              <tr>
                <td colSpan="8" className="no-data">
                  No interviews found.
                </td>
              </tr>
            ) : (
              filteredInterviews.map((interview) => (
                <React.Fragment key={interview.interviewId}>
                  <tr>
                    <td>{interview.collegeName}</td>
                    <td>{interview.driveName}</td>
                    <td>{interview.studentName}</td>
                    <td>{interview.studentEmail}</td>
                    <td>{interview.roundNumber}</td>
                    <td>{interview.panelMemberName}</td>
                    <td>{formatDateTime(interview.startTime)}</td>
                    <td>
                      <button
                        className="reschedule-btn"
                        onClick={() => {
                          if (rescheduleId === interview.interviewId) {
                            setRescheduleId(null);
                          } else {
                            setRescheduleId(interview.interviewId);
                            setNewStartTime(formatForInput(interview.startTime));
                            setNewEndTime(formatForInput(interview.endTime));
                          }
                        }}
                      >
                        {rescheduleId === interview.interviewId
                          ? "Close"
                          : "Reschedule"}
                      </button>
                    </td>
                  </tr>

                  {rescheduleId === interview.interviewId && (
                    <tr>
                      <td colSpan="8">
                        <div className="reschedule-form">
                          <select
                            value={newPanelMemberId}
                            onChange={(e) => setNewPanelMemberId(e.target.value)}
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
                            value={newStartTime}
                            onChange={(e) => setNewStartTime(e.target.value)}
                          />

                          <input
                            type="datetime-local"
                            value={newEndTime}
                            onChange={(e) => setNewEndTime(e.target.value)}
                          />

                          <button
                            className="confirm-btn"
                            onClick={() =>
                              rescheduleInterview(interview.interviewId)
                            }
                          >
                            Confirm
                          </button>

                          <button
                            className="cancel-btn"
                            onClick={() => setRescheduleId(null)}
                          >
                            Cancel
                          </button>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ScheduledInterviews;