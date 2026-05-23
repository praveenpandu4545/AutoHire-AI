import React, { useEffect, useState } from "react";
import StudentsByDrive from "./StudentsByDrive";
import "../../css/AllDrives.css";

const AllDrives = () => {
  const BASE_URL = import.meta.env.VITE_SPRING_API_BASE_URL;

  const [drives, setDrives] = useState([]);
  const [expandedDrive, setExpandedDrive] = useState(null);
  const [showDetails, setShowDetails] = useState(null);
  const [selectedDrive, setSelectedDrive] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Rename states
  const [renamingDriveId, setRenamingDriveId] = useState(null);
  const [newDriveName, setNewDriveName] = useState("");

  useEffect(() => {
    fetchDrives();
  }, []);

  const handleDeleteDrive = async (driveId) => {
  const confirmDelete = window.confirm(
    "Are you sure you want to delete this drive?"
  );

  if (!confirmDelete) return;

  try {
    const token =
      localStorage.getItem("token");

    const response = await fetch(
      `${BASE_URL}/springApi/delete/drive/${driveId}`,
      {
        method: "DELETE",
        headers: {
          Authorization:
            `Bearer ${token}`,
        },
      }
    );

    const message =
      await response.text();

    if (response.ok) {
      alert(message);

      // remove drive instantly from UI
      setDrives((prevDrives) =>
        prevDrives.filter(
          (drive) =>
            drive.id !== driveId
        )
      );

      // reset expanded state
      if (
        expandedDrive === driveId
      ) {
        setExpandedDrive(null);
      }

      if (
        showDetails === driveId
      ) {
        setShowDetails(null);
      }

      if (
        renamingDriveId ===
        driveId
      ) {
        setRenamingDriveId(
          null
        );
      }
    } else {
      alert(message);
    }
  } catch (error) {
    console.error(
      "Delete error:",
      error
    );

    alert(
      "Something went wrong"
    );
  }
};

  const fetchDrives = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        `${BASE_URL}/springApi/drive/getAll`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();
      setDrives(data);
    } catch (error) {
      console.error("Error fetching drives:", error);
    }
  };

  const handleRename = async (driveId) => {
  if (!newDriveName.trim()) {
    alert("Please enter a drive name");
    return;
  }

  try {
    const token = localStorage.getItem("token");

    const response = await fetch(
      `${BASE_URL}/springApi/drive/rename/${driveId}?newName=${encodeURIComponent(
        newDriveName
      )}`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const message = await response.text();

    if (response.ok) {
      alert(message);

      // Update UI instantly
      setDrives((prevDrives) =>
        prevDrives.map((drive) =>
          drive.id === driveId
            ? {
                ...drive,
                driveName: newDriveName,
              }
            : drive
        )
      );

      // Reset states
      setRenamingDriveId(null);
      setNewDriveName("");
    } else {
      alert(message);
    }
  } catch (error) {
    console.error("Rename error:", error);
    alert("Something went wrong");
  }
};

  // Navigate to Students Page
  if (selectedDrive) {
    return (
      <StudentsByDrive
        driveId={selectedDrive.id}
        onBack={() => setSelectedDrive(null)}
      />
    );
  }

  // Filter drives
  const filteredDrives = drives.filter(
    (drive) =>
      drive.collegeName
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      drive.driveName
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
  );

  // Group drives
  const groupedDrives = filteredDrives.reduce((acc, drive) => {
    if (!acc[drive.collegeName]) {
      acc[drive.collegeName] = [];
    }

    acc[drive.collegeName].push(drive);
    return acc;
  }, {});

  return (
    <div className="all-drives-container">
      <div className="students-header">
        <h2>All Drives</h2>
      </div>

      <input
        type="text"
        placeholder="Search by College or Drive Name..."
        className="drive-search-input"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      {Object.keys(groupedDrives).length === 0 && (
        <p className="no-data">No drives found.</p>
      )}

      {Object.keys(groupedDrives).map((college) => (
        <div key={college} className="college-section">
          <h3 className="college-name">{college}</h3>

          {groupedDrives[college].map((drive) => (
            <div key={drive.id} className="drive-item">
              <div
                className="drive-title"
                onClick={() =>
                  setExpandedDrive(
                    expandedDrive === drive.id
                      ? null
                      : drive.id
                  )
                }
              >
                {drive.driveName}
              </div>

              {expandedDrive === drive.id && (
                <div className="students-section">
                  <button
                    className="registered-btn"
                    onClick={() =>
                      setSelectedDrive(drive)
                    }
                  >
                    Registered Students
                  </button>

                  <button
                    className="details-btn"
                    onClick={() =>
                      setShowDetails(
                        showDetails === drive.id
                          ? null
                          : drive.id
                      )
                    }
                  >
                    Details
                  </button>

                  {showDetails === drive.id && (
                    <div className="details-section">
                      <p>
                        <strong>No of Rounds:</strong>{" "}
                        {drive.noOfRounds}
                      </p>

                      <strong>Rounds:</strong>
                      <ul>
                        {drive.rounds.map(
                          (round, index) => (
                            <li key={index}>
                              Round {round.roundNumber}:{" "}
                              {round.roundName}
                            </li>
                          )
                        )}
                      </ul>

                      <strong>Required Skills:</strong>
                      <ul>
                        {drive.requiredSkills.map(
                          (skill, index) => (
                            <li key={index}>
                              {skill}
                            </li>
                          )
                        )}
                      </ul>

                      {/* Rename Button */}
                      <div
                        style={{
                          display: "flex",
                          gap: "10px",
                          marginTop: "15px",
                        }}
                      >
                        <button
                          className="rename-btn"
                          onClick={() => {
                            setRenamingDriveId(
                              renamingDriveId ===
                                drive.id
                                ? null
                                : drive.id
                            );

                            setNewDriveName("");
                          }}
                        >
                          Rename
                        </button>

                        <button
                          className="delete-btn"
                          onClick={() =>
                            handleDeleteDrive(
                              drive.id
                            )
                          }
                        >
                          Delete
                        </button>
                      </div>

                      {/* Rename Input */}
                      {renamingDriveId ===
                        drive.id && (
                        <div
                          style={{
                            marginTop: "15px",
                          }}
                        >
                          <input
                            type="text"
                            placeholder={
                              drive.driveName
                            }
                            value={newDriveName}
                            onChange={(e) =>
                              setNewDriveName(
                                e.target.value
                              )
                            }
                          />

                          <button
                            onClick={() =>
                              handleRename(
                                drive.id
                              )
                            }
                            style={{
                              marginLeft:
                                "10px",
                            }}
                          >
                            Save
                          </button>
                        </div>
                      )}
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