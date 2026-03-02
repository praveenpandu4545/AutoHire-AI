import React, { useEffect, useMemo, useState } from "react";
import "../../css/ScheduleAutomatedInterviews.css";

const ScheduleAutomatedInterviews = ({ driveId, students = [], onBack }) => {
  const BASE_URL = import.meta.env.VITE_SPRING_API_BASE_URL;
  const token = localStorage.getItem("token");

  // =============================
  // STUDENT SELECTION
  // =============================
  const eligibleStudents = useMemo(() => {
    return students.filter(
      (s) =>
        s.finalStatus !== "SELECTED" &&
        s.finalStatus !== "REJECTED"
    );
  }, [students]);

  const [showStudents, setShowStudents] = useState(false);
  const [selectedStudents, setSelectedStudents] = useState([]);

  useEffect(() => {
    setSelectedStudents(eligibleStudents.map((s) => s.id));
  }, [eligibleStudents]);

  const toggleStudent = (id) => {
    setSelectedStudents((prev) =>
      prev.includes(id)
        ? prev.filter((sid) => sid !== id)
        : [...prev, id]
    );
  };

  // =============================
  // PANEL MEMBERS
  // =============================
  const [panelMembers, setPanelMembers] = useState([]);
  const [showPanels, setShowPanels] = useState(false);
  const [selectedPanels, setSelectedPanels] = useState([]);

  useEffect(() => {
    fetchPanelMembers();
  }, []);

  const fetchPanelMembers = async () => {
    try {
      const response = await fetch(
        `${BASE_URL}/springApi/employees/panel-members`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await response.json();
      setPanelMembers(data);
      setSelectedPanels(data.map((p) => p.id));
    } catch (error) {
      console.error("Failed to fetch panel members:", error);
    }
  };

  const togglePanel = (id) => {
    setSelectedPanels((prev) =>
      prev.includes(id)
        ? prev.filter((pid) => pid !== id)
        : [...prev, id]
    );
  };

  // =============================
  // SCHEDULING SETTINGS
  // =============================
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("18:00");
  const [interviewDuration, setInterviewDuration] = useState(30);
  const [roundNumber, setRoundNumber] = useState(1);
  const [startDate, setStartDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  const [breaks, setBreaks] = useState([
    { start: "13:00", end: "14:00" },
  ]);

  const addBreak = () => {
    setBreaks([...breaks, { start: "", end: "" }]);
  };

  const removeBreak = (index) => {
    setBreaks(breaks.filter((_, i) => i !== index));
  };

  const updateBreak = (index, field, value) => {
    const updated = [...breaks];
    updated[index][field] = value;
    setBreaks(updated);
  };

  // =============================
  // LOADING & RESPONSE STATE
  // =============================
  const [loading, setLoading] = useState(false);
  const [responseMessage, setResponseMessage] = useState("");

  // =============================
  // AUTO SCHEDULE
  // =============================
  const handleAutoSchedule = async () => {
    if (selectedStudents.length === 0) {
      alert("No students selected");
      return;
    }

    if (selectedPanels.length === 0) {
      alert("No panel members selected");
      return;
    }

    const autoScheduleRequest = {
      driveId,
      roundNumber: Number(roundNumber),
      startDate,
      studentIds: selectedStudents,
      panelMemberIds: selectedPanels,
      startTime,
      endTime,
      breaks,
      interviewDuration: Number(interviewDuration),
    };

    try {
      setLoading(true);
      setResponseMessage("");

      const response = await fetch(
        `${BASE_URL}/springApi/interviews/auto-schedule`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(autoScheduleRequest),
        }
      );

      // Handle non-JSON responses safely
      const contentType = response.headers.get("content-type");

      let data = null;

      if (contentType && contentType.includes("application/json")) {
        data = await response.json();
      } else {
        const text = await response.text();
        data = { message: text };
      }

      if (!response.ok) {
        throw new Error(data.message || "Auto scheduling failed");
      }

     alert(data.message || "Auto scheduling completed successfully ✅");

    } catch (error) {
      console.error("Auto scheduling error:", error);
      setResponseMessage(error.message || "Something went wrong ❌");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="automation-container">
      <h2>Auto Schedule Interviews</h2>

      <button className="back-btn" onClick={onBack}>
        ← Back to Students
      </button>

      {/* STUDENTS */}
      <div className="automation-section">
        <div className="section-header">
          <h3>Students</h3>
          <button onClick={() => setShowStudents(!showStudents)}>
            {showStudents ? "Hide Students" : "View Students"}
          </button>
        </div>

        <p>Total Eligible: {eligibleStudents.length}</p>
        <p>Selected: {selectedStudents.length}</p>

        {showStudents && (
          <div className="checkbox-list">
            {eligibleStudents.map((student) => (
              <label key={student.id}>
                <input
                  type="checkbox"
                  checked={selectedStudents.includes(student.id)}
                  onChange={() => toggleStudent(student.id)}
                />
                {student.studentId} - {student.name}
              </label>
            ))}
          </div>
        )}
      </div>

      {/* PANELS */}
      <div className="automation-section">
        <div className="section-header">
          <h3>Panel Members</h3>
          <button onClick={() => setShowPanels(!showPanels)}>
            {showPanels ? "Hide Panels" : "View Panels"}
          </button>
        </div>

        <p>Total Panels: {panelMembers.length}</p>
        <p>Selected: {selectedPanels.length}</p>

        {showPanels && (
          <div className="checkbox-list">
            {panelMembers.map((panel) => (
              <label key={panel.id}>
                <input
                  type="checkbox"
                  checked={selectedPanels.includes(panel.id)}
                  onChange={() => togglePanel(panel.id)}
                />
                {panel.name}
              </label>
            ))}
          </div>
        )}
      </div>

      {/* SETTINGS */}
      <div className="automation-section">
        <h3>Schedule Settings</h3>

        <div className="settings-grid">
          <div>
            <label>Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>

          <div>
            <label>Start Time</label>
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
            />
          </div>

          <div>
            <label>End Time</label>
            <input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
            />
          </div>

          <div>
            <label>Interview Duration (minutes)</label>
            <input
              type="number"
              value={interviewDuration}
              onChange={(e) => setInterviewDuration(e.target.value)}
            />
          </div>

          <div>
            <label>Round Number</label>
            <input
              type="number"
              min="1"
              value={roundNumber}
              onChange={(e) => setRoundNumber(e.target.value)}
            />
          </div>
        </div>

        {/* BREAKS */}
        <div className="break-section">
          <h4>Break Times</h4>

          {breaks.map((brk, index) => (
            <div key={index} className="break-row">
              <input
                type="time"
                value={brk.start}
                onChange={(e) => updateBreak(index, "start", e.target.value)}
              />
              <span>to</span>
              <input
                type="time"
                value={brk.end}
                onChange={(e) => updateBreak(index, "end", e.target.value)}
              />
              <button onClick={() => removeBreak(index)}>Remove</button>
            </div>
          ))}

          <button onClick={addBreak}>+ Add Break</button>
        </div>
      </div>

      <div className="automation-action">
        <button
          className="run-btn"
          onClick={handleAutoSchedule}
          disabled={loading}
        >
          {loading ? "Scheduling..." : "Run Auto Scheduling"}
        </button>
      </div>
    </div>
  );
};

export default ScheduleAutomatedInterviews; 