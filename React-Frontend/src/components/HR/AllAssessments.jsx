import React, { useEffect, useState } from "react";
import "../../css/AllAssessments.css";
import * as XLSX from "xlsx";

const BASE_URL = import.meta.env.VITE_SPRING_API_BASE_URL;

const AllAssessments = ({ onBack }) => {

  const token = localStorage.getItem("token");

  const [assessments, setAssessments] = useState([]);
  const [search, setSearch] = useState("");
  const [roundFilter, setRoundFilter] = useState("");
  const [collegeFilter, setCollegeFilter] = useState("");

  // 🔥 RESULTS STATE
  const [results, setResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [selectedAssessmentId, setSelectedAssessmentId] = useState(null);

  // 🔥 NEW STATES
  const [studentSearch, setStudentSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // ================= FETCH ASSESSMENTS =================
  useEffect(() => {
    fetch(`${BASE_URL}/springApi/assessment/getAll`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(setAssessments)
      .catch(console.error);
  }, []);

  // ================= FETCH RESULTS =================
  const handleViewResults = async (assessmentId) => {
    try {
      const response = await fetch(
        `${BASE_URL}/springApi/assessment/results/${assessmentId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!response.ok) {
        const error = await response.text();
        alert(error);
        return;
      }

      const data = await response.json();

      // 🔥 SORT BY MARKS DESCENDING
      const sorted = data.sort((a, b) => b.marks - a.marks);

      setResults(sorted);
      setSelectedAssessmentId(assessmentId);
      setShowResults(true);

    } catch (err) {
      console.error(err);
      alert("Failed to fetch results");
    }
  };

  // ================= DOWNLOAD EXCEL =================
  const downloadExcel = () => {
    const formatted = filteredResults.map((r) => ({
      Student: r.studentName,
      Marks: r.marks,
      Status: r.qualified ? "Qualified" : "Not Qualified",
      Attempt: r.attemptNumber,
    }));

    const worksheet = XLSX.utils.json_to_sheet(formatted);
    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, "Results");

    XLSX.writeFile(workbook, `Assessment_${selectedAssessmentId}_Results.xlsx`);
  };

  // ================= FILTER RESULTS =================
  const filteredResults = results
    .filter(r =>
      r.studentName.toLowerCase().includes(studentSearch.toLowerCase())
    )
    .filter(r => {
      if (statusFilter === "ALL") return true;
      if (statusFilter === "QUALIFIED") return r.qualified;
      if (statusFilter === "NOT_QUALIFIED") return !r.qualified;
      return true;
    });

  // ================= FILTER ASSESSMENTS =================
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

  const uniqueRounds = [...new Set(assessments.map(a => a.roundName))];
  const uniqueColleges = [...new Set(assessments.map(a => a.collegeName))];

  // ================= RESULTS VIEW =================
  if (showResults) {
    return (
      <div className="results-page">

        <div className="top-bar">
          <button
  className="back-btn"
  onClick={() => setShowResults(false)}
  style={{
    backgroundColor: "blue",
    color: "white",
    padding: "10px 20px",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer"
  }}
>
  ← Back
</button>
          <h2>Assessment Results</h2>
        </div>

        {/* 🔥 FILTERS */}
        <div className="filters">

          <input
            type="text"
            placeholder="Search student..."
            value={studentSearch}
            onChange={(e) => setStudentSearch(e.target.value)}
          />

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="ALL">All</option>
            <option value="QUALIFIED">Qualified</option>
            <option value="NOT_QUALIFIED">Not Qualified</option>
          </select>

        </div>

        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Rank</th>
                <th>Student</th>
                <th>Marks</th>
                <th>Status</th>
                <th>Attempt</th>
              </tr>
            </thead>

            <tbody>
              {filteredResults.map((r, index) => (
                <tr key={`${r.studentName}-${index}`}>
                  <td>{index + 1}</td>
                  <td>{r.studentName}</td>
                  <td>{r.marks}</td>
                  <td>
                    {r.qualified ? "Qualified" : "Not Qualified"}
                  </td>
                  <td>{r.attemptNumber}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <button className="download-btn" onClick={downloadExcel}>
          ⬇ Download Excel
        </button>

      </div>
    );
  }

  // ================= MAIN VIEW =================
  return (
    <div className="all-assessments">

      <div className="top-bar">
        <button 
  className="back-btn" 
  onClick={onBack}
  style={{ 
    backgroundColor: 'blue', 
    color: 'white', 
    padding: '10px 20px', 
    border: 'none', 
    borderRadius: '5px',
    cursor: 'pointer' 
  }}
>
  ⬅ Back
</button>

        <h2>Assessments</h2>
      </div>

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
              <th>Actions</th>
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

                <td>
                  <button
                    className="results-btn"
                    onClick={() => handleViewResults(a.id)}
                  >
                    📊 Results
                  </button>
                </td>

              </tr>
            ))}
          </tbody>

        </table>

      </div>
    </div>
  );
};

export default AllAssessments;