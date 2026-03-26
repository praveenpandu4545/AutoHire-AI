import React, { useEffect, useState } from "react";
import "../../css/AllAssessments.css";

const BASE_URL = import.meta.env.VITE_SPRING_API_BASE_URL;

const AllAssessments = ({ onBack, onEdit }) => {

  const token = localStorage.getItem("token");

  const [assessments, setAssessments] = useState([]);
  const [search, setSearch] = useState("");
  const [roundFilter, setRoundFilter] = useState("");
  const [collegeFilter, setCollegeFilter] = useState("");

  useEffect(() => {
    fetch(`${BASE_URL}/springApi/assessment/getAll`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(setAssessments)
      .catch(console.error);
  }, []);

  // ================= FILTER LOGIC =================
  const filtered = assessments.filter(a => {
    const text = search.toLowerCase();

    return (
      a.title?.toLowerCase().includes(text) ||
      a.driveName?.toLowerCase().includes(text) ||
      a.collegeName?.toLowerCase().includes(text) ||
      a.roundName?.toLowerCase().includes(text)
    ) &&
    (roundFilter === "" || a.roundName === roundFilter) &&
    (collegeFilter === "" || a.collegeName === collegeFilter);
  });

  // ================= UNIQUE FILTER VALUES =================
  const uniqueRounds = [...new Set(assessments.map(a => a.roundName))];
  const uniqueColleges = [...new Set(assessments.map(a => a.collegeName))];

  return (
    <div className="all-assessments">

      {/* HEADER */}
      <div className="top-bar">
        <button className="back-btn" onClick={onBack}>← Back</button>
        <h2>Assessments</h2>
      </div>

      {/* FILTERS */}
      <div className="filters">

        <input
          type="text"
          placeholder="Search by title, college, drive, round..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select value={roundFilter} onChange={(e) => setRoundFilter(e.target.value)}>
          <option value="">All Rounds</option>
          {uniqueRounds.map((r, i) => (
            <option key={i}>{r}</option>
          ))}
        </select>

        <select value={collegeFilter} onChange={(e) => setCollegeFilter(e.target.value)}>
          <option value="">All Colleges</option>
          {uniqueColleges.map((c, i) => (
            <option key={i}>{c}</option>
          ))}
        </select>

      </div>

      {/* TABLE */}
      <div className="table-wrapper">

        <table>
          <thead>
            <tr>
              <th>Title</th>
              <th>Drive</th>
              <th>College</th>
              <th>Round</th>
              <th>Duration</th>
              <th>Total Marks</th>
              <th>Start</th>
              {/* <th>Actions</th> */}
            </tr>
          </thead>

          <tbody>
            {filtered.map(a => (
                <tr key={a.id}>
                <td>{a.title}</td>
                <td>{a.driveName}</td>
                <td>{a.collegeName}</td>
                <td>{a.roundNumber}. {a.roundName}</td>
                <td>{a.duration} mins</td>
                <td>{a.totalMarks}</td>
                <td>{new Date(a.startTime).toLocaleString()}</td>

                {/* ✅ ACTION BUTTON
                <td>
                    <button
                    className="edit-btn"
                    onClick={() => onEdit(a)}
                    >
                    ✏️ Edit
                    </button>
                </td> */}
                </tr>
            ))}
            </tbody>

        </table>

      </div>
    </div>
  );
};

export default AllAssessments;