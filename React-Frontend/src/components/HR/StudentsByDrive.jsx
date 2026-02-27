import React, { useEffect, useState, useMemo } from "react";
import StudentRounds from "./StudentRounds";
import "../../css/AllDrives.css";

const StudentsByDrive = ({ driveId, onBack }) => {
  const BASE_URL = import.meta.env.VITE_SPRING_API_BASE_URL;

  const [students, setStudents] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [bulkUploading, setBulkUploading] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState(null);

  // ✅ FILTER STATES
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");

  useEffect(() => {
    fetchStudents();
  }, [driveId]);

  const fetchStudents = async () => {
    try {
      setLoadingStudents(true);
      const token = localStorage.getItem("token");

      const response = await fetch(
        `${BASE_URL}/springApi/student/getAll/${driveId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const data = await response.json();

      const updatedStudents = await Promise.all(
        data.map(async (student) => {
          const roundsRes = await fetch(
            `${BASE_URL}/springApi/student/getAllRounds/${student.id}/driveId/${driveId}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );

          const rounds = await roundsRes.json();

          if (rounds.length === 0) {
            student.finalStatus = "IN PROGRESS";
          } else {
            const lastRound = rounds.reduce((prev, current) =>
              prev.roundNumber > current.roundNumber ? prev : current
            );
            student.finalStatus = lastRound.status;
          }

          return student;
        })
      );

      setStudents(updatedStudents);
      setLoadingStudents(false);
    } catch (error) {
      console.error(error);
      setLoadingStudents(false);
    }
  };

  // =============================
  // UNIQUE DEPARTMENTS (Dynamic)
  // =============================
  const uniqueDepartments = useMemo(() => {
    return [...new Set(students.map((s) => s.department))];
  }, [students]);

  // =============================
  // UNIQUE STATUSES (Dynamic)
  // =============================
  const uniqueStatuses = useMemo(() => {
    return [...new Set(students.map((s) => s.finalStatus))];
  }, [students]);

  // =============================
  // FILTER LOGIC (All Combined)
  // =============================
  const filteredStudents = students.filter((student) => {
  const search = searchTerm.toLowerCase();

  const matchesSearch =
    String(student.studentId || "").toLowerCase().includes(search) ||
    String(student.name || "").toLowerCase().includes(search) ||
    String(student.department || "").toLowerCase().includes(search) ||
    String(student.email || "").toLowerCase().includes(search) ||
    String(student.finalStatus || "").toLowerCase().includes(search) ||
    String(student.phone || "").includes(search); // ✅ FIXED

  const matchesStatus =
    statusFilter === "" || student.finalStatus === statusFilter;

  const matchesDepartment =
    departmentFilter === "" || student.department === departmentFilter;

  return matchesSearch && matchesStatus && matchesDepartment;
});

  // =============================
  // EXCEL UPLOAD
  // =============================
  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      setUploading(true);
      const token = localStorage.getItem("token");

      const formData = new FormData();
      formData.append("driveId", driveId);
      formData.append("file", file);

      const response = await fetch(
        `${BASE_URL}/springApi/student/upload`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        }
      );

      if (!response.ok) {
        alert(await response.text());
        setUploading(false);
        return;
      }

      alert("Students uploaded successfully ✅");
      await fetchStudents();
      setUploading(false);
    } catch (error) {
      console.error(error);
      setUploading(false);
    }
  };

  // =============================
  // BULK STATUS UPDATE
  // =============================
  const handleBulkStatusUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      setBulkUploading(true);
      const token = localStorage.getItem("token");

      const formData = new FormData();
      formData.append("driveId", driveId);
      formData.append("file", file);

      const response = await fetch(
        `${BASE_URL}/springApi/student-round-status/bulk-update`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        }
      );

      if (!response.ok) {
        alert(await response.text());
        setBulkUploading(false);
        return;
      }

      const data = await response.json();

      alert(`
Total Rows: ${data.totalRows}
Success: ${data.successCount}
Failed: ${data.failedCount}
      `);

      await fetchStudents();
      setBulkUploading(false);
    } catch (error) {
      console.error(error);
      setBulkUploading(false);
    }
  };

  // =============================
  // NAVIGATION
  // =============================
  if (selectedStudentId) {
    return (
      <StudentRounds
        studentId={selectedStudentId}
        driveId={driveId}
        onBack={() => setSelectedStudentId(null)}
        refreshStudents={fetchStudents}
      />
    );
  }

  return (
    <div className="all-drives-container">
      <div className="students-header">
        <h2>Registered Students</h2>

        {/* 🔎 SEARCH */}
        <input
          type="text"
          placeholder="Search..."
          className="drive-search-input"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        {/* 🎯 FILTERS */}
        <div style={{ display: "flex", gap: "10px", marginBottom: "15px" }}>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="drive-search-input"
          >
            <option value="">All Status</option>
            {uniqueStatuses.map((status, index) => (
              <option key={index} value={status}>
                {status}
              </option>
            ))}
          </select>

          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="drive-search-input"
          >
            <option value="">All Departments</option>
            {uniqueDepartments.map((dept, index) => (
              <option key={index} value={dept}>
                {dept}
              </option>
            ))}
          </select>
        </div>

        <div className="students-actions">
          <button className="back-btn" onClick={onBack}>
            ← Back to Drives
          </button>

          <button
            className="upload-btn"
            disabled={uploading}
            onClick={() => document.getElementById("excelUpload").click()}
          >
            {uploading ? "Uploading..." : "Upload Students (Excel)"}
          </button>

          <button
            className="upload-btn"
            disabled={bulkUploading}
            onClick={() => document.getElementById("statusUpload").click()}
          >
            {bulkUploading ? "Updating..." : "Update Status (Excel)"}
          </button>

          <input
            type="file"
            id="excelUpload"
            accept=".xlsx,.xls"
            style={{ display: "none" }}
            onChange={handleFileUpload}
          />

          <input
            type="file"
            id="statusUpload"
            accept=".xlsx,.xls"
            style={{ display: "none" }}
            onChange={handleBulkStatusUpload}
          />
        </div>
      </div>

      {loadingStudents ? (
        <p>Loading students...</p>
      ) : filteredStudents.length === 0 ? (
        <p>No students found.</p>
      ) : (
        <table className="students-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Student ID</th>
              <th>Name</th>
              <th>Department</th>
              <th>Phone</th>
              <th>Email</th>
              <th>Status</th>
              <th>Rounds</th>
            </tr>
          </thead>
          <tbody>
            {filteredStudents.map((student, index) => (
              <tr key={student.id}>
                <td>{index + 1}</td>
                <td>{student.studentId}</td>
                <td>{student.name}</td>
                <td>{student.department}</td>
                <td>{student.phone}</td>
                <td>{student.email}</td>
                <td>{student.finalStatus}</td>
                <td>
                  <button
                    className="details-btn"
                    onClick={() => setSelectedStudentId(student.id)}
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default StudentsByDrive;