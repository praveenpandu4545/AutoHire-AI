import React, { useEffect, useState } from "react";

const StudentDrives = () => {
  const BASE_URL = import.meta.env.VITE_SPRING_API_BASE_URL;
  const token = localStorage.getItem("token");

  const [drives, setDrives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchDrives();
  }, []);

  const fetchDrives = async () => {
    try {
      const response = await fetch(
        `${BASE_URL}/springApi/drive/student`,
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

    } catch (err) {
      console.error(err);
      setError("Unable to load drives");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div style={{ padding: "20px" }}>Loading drives...</div>;

  if (error) return <div style={{ padding: "20px", color: "red" }}>{error}</div>;

  return (
    <div style={{ padding: "20px" }}>
      <h2>Available Drives</h2>

      {drives.length === 0 ? (
        <p>No drives available for your college.</p>
      ) : (
        drives.map((drive) => (
          <div
            key={drive.id}
            style={{
              border: "1px solid #ddd",
              padding: "15px",
              marginBottom: "15px",
              borderRadius: "8px",
              backgroundColor: "#f9f9f9"
            }}
          >
            <h3>{drive.driveName}</h3>

            <p>
              <strong>No of Rounds:</strong> {drive.noOfRounds}
            </p>

            <div>
              <strong>Required Skills:</strong>
              <ul>
                {drive.requiredSkills?.map((skill, index) => (
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

export default StudentDrives;