import React, { useEffect, useState } from "react";
import "../css/AllDrives.css";

const AllDrives = () => {
  const BASE_URL = import.meta.env.VITE_SPRING_API_BASE_URL;

  const [drives, setDrives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchDrives();
  }, []);

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

      if (!response.ok) {
        throw new Error("Failed to fetch drives");
      }

      const data = await response.json();
      setDrives(data);
      setLoading(false);

    } catch (error) {
      console.error(error);
      setMessage("Error fetching drives");
      setLoading(false);
    }
  };

  if (loading) return <div>Loading drives...</div>;

  return (
    <div className="all-drives-container">
      <h2>All Drives</h2>

      {message && <p className="error">{message}</p>}

      {drives.length === 0 ? (
        <p>No drives available.</p>
      ) : (
        drives.map((drive) => (
          <div key={drive.id} className="drive-card">
            <h3>{drive.driveName}</h3>

            <p><strong>College:</strong> {drive.collegeName}</p>
            <p><strong>No of Rounds:</strong> {drive.noOfRounds}</p>

            <div className="rounds-section">
              <strong>Rounds:</strong>
              <ul>
                {drive.rounds.map((round, index) => (
                  <li key={index}>
                    Round {round.roundNumber}: {round.roundName}
                  </li>
                ))}
              </ul>
            </div>

            <div className="skills-section">
              <strong>Required Skills:</strong>
              <ul>
                {drive.requiredSkills.map((skill, index) => (
                  <li key={index}>{skill}</li>
                ))}
              </ul>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default AllDrives;