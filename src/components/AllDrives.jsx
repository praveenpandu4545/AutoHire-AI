import React, { useEffect, useState } from "react";
import "../css/AllDrives.css";

const AllDrives = () => {
  const BASE_URL = import.meta.env.VITE_SPRING_API_BASE_URL;

  const [drives, setDrives] = useState([]);
  const [expandedDrive, setExpandedDrive] = useState(null);
  const [showDetails, setShowDetails] = useState(null);

  const [selectedDriveId, setSelectedDriveId] = useState(null);
  const [students, setStudents] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(false);

  const [uploading, setUploading] = useState(false);

  // 🔥 NEW STATES
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [studentRounds, setStudentRounds] = useState([]);
  const [loadingRounds, setLoadingRounds] = useState(false);

  useEffect(() => {
    fetchDrives();
  }, []);

  const fetchDrives = async () => {
    const token = localStorage.getItem("token");

    const response = await fetch(
      `${BASE_URL}/springApi/drive/getAll`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    const data = await response.json();
    setDrives(data);
  };

  // ===============================
  // FETCH STUDENTS
  // ===============================
  const fetchStudents = async (driveId) => {
  try {
    setLoadingStudents(true);
    const token = localStorage.getItem("token");

    const response = await fetch(
      `${BASE_URL}/springApi/student/getAll/${driveId}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    const data = await response.json();

    // 🔥 For each student, fetch rounds and compute final status
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
          // Get highest roundNumber
          const lastRound = rounds.reduce((prev, current) =>
            prev.roundNumber > current.roundNumber ? prev : current
          );

          student.finalStatus = lastRound.status;
        }

        return student;
      })
    );

    setStudents(updatedStudents);
    setSelectedDriveId(driveId);
    setLoadingStudents(false);

  } catch (error) {
    console.error(error);
    setLoadingStudents(false);
  }
};

  const handleBack = () => {
    setSelectedDriveId(null);
    setStudents([]);
  };

  // ===============================
  // FILE UPLOAD
  // ===============================
  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      setUploading(true);
      const token = localStorage.getItem("token");

      const formData = new FormData();
      formData.append("driveId", selectedDriveId);
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
      await fetchStudents(selectedDriveId);
      setUploading(false);

    } catch (error) {
      console.error(error);
      setUploading(false);
    }
  };

  // ===============================
  // FETCH STUDENT ROUNDS
  // ===============================
  const fetchStudentRounds = async (studentId) => {
    try {
      setLoadingRounds(true);
      const token = localStorage.getItem("token");

      const response = await fetch(
        `${BASE_URL}/springApi/student/getAllRounds/${studentId}/driveId/${selectedDriveId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const data = await response.json();
      setStudentRounds(data);
      setSelectedStudentId(studentId);
      setLoadingRounds(false);

    } catch (error) {
      console.error(error);
      setLoadingRounds(false);
    }
  };

  // ===============================
  // UPDATE ROUND STATUS
  // ===============================
  const updateRoundStatus = async (roundId, newStatus) => {
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
        body: JSON.stringify({ status: newStatus }),
      }
    );

    // Refresh rounds page
    fetchStudentRounds(selectedStudentId);

    // 🔥 Refresh students table also
    fetchStudents(selectedDriveId);

  } catch (error) {
    console.error(error);
  }
};

  // ===============================
  // STUDENT ROUNDS PAGE
  // ===============================
  if (selectedStudentId) {
    return (
      <div className="all-drives-container">
        <h2>Student Round Details</h2>

        <button
          className="back-btn"
          onClick={() => setSelectedStudentId(null)}
        >
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
              {studentRounds.map((round) => (
                <tr key={round.id}>
                  <td>{round.roundNumber}</td>
                  <td>{round.roundName}</td>
                  <td>{round.status}</td>
                  <td>
                    <select
                      value={round.status}
                      onChange={(e) =>
                        updateRoundStatus(round.id, e.target.value)
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
  }

  // ===============================
  // STUDENTS PAGE
  // ===============================
  if (selectedDriveId) {
    return (
      <div className="all-drives-container">
        <div className="students-header">
          <h2>Registered Students</h2>

          <div className="students-actions">
            <button className="back-btn" onClick={handleBack}>
              ← Back to Drives
            </button>

            <button
              className="upload-btn"
              disabled={uploading}
              onClick={() =>
                document.getElementById("excelUpload").click()
              }
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
        ) : students.length === 0 ? (
          <p>No students registered.</p>
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
                <th>View</th>
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

                  <td>{student.finalStatus || "IN PROGRESS"}</td>

                  <td>
                    <button
                      className="details-btn"
                      onClick={() =>
                        fetchStudentRounds(student.id)
                      }
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
  }

  // ===============================
  // DRIVES PAGE
  // ===============================
  const groupedDrives = drives.reduce((acc, drive) => {
    if (!acc[drive.collegeName]) acc[drive.collegeName] = [];
    acc[drive.collegeName].push(drive);
    return acc;
  }, {});

  return (
    <div className="all-drives-container">
      <h2>All Drives</h2>

      {Object.keys(groupedDrives).map((college) => (
        <div key={college} className="college-section">
          <h3 className="college-name">{college}</h3>

          {groupedDrives[college].map((drive) => (
            <div key={drive.id} className="drive-item">
              <div
                className="drive-title"
                onClick={() =>
                  setExpandedDrive(
                    expandedDrive === drive.id ? null : drive.id
                  )
                }
              >
                {drive.driveName}
              </div>

              {expandedDrive === drive.id && (
  <div className="students-section">

    <button
      className="registered-btn"
      onClick={() => fetchStudents(drive.id)}
    >
      Registered Students
    </button>

    <button
      className="details-btn"
      onClick={() =>
        setShowDetails(
          showDetails === drive.id ? null : drive.id
        )
      }
    >
      Details
    </button>

    {showDetails === drive.id && (
      <div className="details-section">
        <p><strong>No of Rounds:</strong> {drive.noOfRounds}</p>

        <strong>Rounds:</strong>
        <ul>
          {drive.rounds.map((round, index) => (
            <li key={index}>
              Round {round.roundNumber}: {round.roundName}
            </li>
          ))}
        </ul>

        <strong>Required Skills:</strong>
        <ul>
          {drive.requiredSkills.map((skill, index) => (
            <li key={index}>{skill}</li>
          ))}
        </ul>
      </div>
    )}

  </div>
)}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default AllDrives;