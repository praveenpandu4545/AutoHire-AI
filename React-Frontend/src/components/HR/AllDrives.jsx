import React, { useEffect, useState } from "react";
import StudentsByDrive from "./StudentsByDrive";
import "../../css/AllDrives.css";

const AllDrives = () => {
  const BASE_URL = import.meta.env.VITE_SPRING_API_BASE_URL;

  const [drives, setDrives] = useState([]);
  const [expandedDrive, setExpandedDrive] = useState(null);
  const [showDetails, setShowDetails] = useState(null);
  const [selectedDrive, setSelectedDrive] = useState(null);
  const [searchTerm, setSearchTerm] = useState(""); // ✅ NEW STATE

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

  // Navigate to Students Page
  if (selectedDrive) {
    return (
      <StudentsByDrive
        driveId={selectedDrive.id}
        onBack={() => setSelectedDrive(null)}
      />
    );
  }

  // ✅ FILTER DRIVES BASED ON SEARCH
  const filteredDrives = drives.filter((drive) =>
    drive.collegeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    drive.driveName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // ✅ GROUP AFTER FILTERING
  const groupedDrives = filteredDrives.reduce((acc, drive) => {
    if (!acc[drive.collegeName]) acc[drive.collegeName] = [];
    acc[drive.collegeName].push(drive);
    return acc;
  }, {});

  return (
    <div className="all-drives-container">
      <h2>All Drives</h2>

      {/* ✅ SEARCH BOX */}
      <input
        type="text"
        placeholder="Search by College or Drive Name..."
        className="drive-search-input"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      {Object.keys(groupedDrives).length === 0 && (
        <p style={{ marginTop: "20px" }}>No drives found.</p>
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
                    onClick={() => setSelectedDrive(drive)}
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