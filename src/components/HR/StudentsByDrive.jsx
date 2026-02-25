import React, { useEffect, useState } from "react";
import StudentRounds from "./StudentRounds";
import "../../css/AllDrives.css";

const StudentsByDrive = ({ driveId, onBack }) => {
  const BASE_URL = import.meta.env.VITE_SPRING_API_BASE_URL;

  const [students, setStudents] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState(null);

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

          <input
            type="file"
            id="excelUpload"
            accept=".xlsx,.xls"
            style={{ display: "none" }}
            onChange={handleFileUpload}
          />
        </div>
      </div>

      {loadingStudents ? (
        <p>Loading students...</p>
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
            {students.map((student, index) => (
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